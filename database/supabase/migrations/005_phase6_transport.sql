-- =================================================================================
-- MIGRATION: Phase 6 - Transport & Backhaul Matching (Final Security Hardened)
-- =================================================================================

-- 1. Create transport_trips table safely
CREATE TABLE IF NOT EXISTS public.transport_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL,
  capacity_kg NUMERIC NOT NULL CHECK (capacity_kg > 0),
  available_capacity_kg NUMERIC NOT NULL CHECK (available_capacity_kg >= 0 AND available_capacity_kg <= capacity_kg),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  primary_route TEXT,
  return_route TEXT,
  departure_time TIMESTAMPTZ NOT NULL,
  trip_type TEXT NOT NULL DEFAULT 'PRIMARY', -- 'PRIMARY', 'BACKHAUL'
  status TEXT NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'MATCHED', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'
  standard_rate_per_trip NUMERIC,
  discounted_backhaul_rate NUMERIC,
  saving_estimate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Trigger for updated_at (reusing the existing function)
DROP TRIGGER IF EXISTS tr_transport_trips_updated_at ON public.transport_trips;
CREATE TRIGGER tr_transport_trips_updated_at
  BEFORE UPDATE ON public.transport_trips
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Safely add trip_id to existing pools table without destroying data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'pools' AND column_name = 'trip_id'
  ) THEN
    ALTER TABLE public.pools ADD COLUMN trip_id UUID REFERENCES public.transport_trips(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_transport_trips_transporter ON public.transport_trips(transporter_id);
CREATE INDEX IF NOT EXISTS idx_transport_trips_status ON public.transport_trips(status);
CREATE INDEX IF NOT EXISTS idx_transport_trips_type ON public.transport_trips(trip_type);

-- 5. Strict Row Level Security Enablement
ALTER TABLE public.transport_trips ENABLE ROW LEVEL SECURITY;

-- 6. Clean up existing/legacy policies for idempotency
DROP POLICY IF EXISTS "Authenticated users can view available trips" ON public.transport_trips;
DROP POLICY IF EXISTS "Transporters can view their own trips" ON public.transport_trips;
DROP POLICY IF EXISTS "Distributors can view relevant trips" ON public.transport_trips;
DROP POLICY IF EXISTS "Government admins can view all trips" ON public.transport_trips;
DROP POLICY IF EXISTS "Farmers can view assigned trips" ON public.transport_trips;
DROP POLICY IF EXISTS "Consumers can view relevant trips" ON public.transport_trips;
DROP POLICY IF EXISTS "Transporters can insert their own trips" ON public.transport_trips;
DROP POLICY IF EXISTS "Transporters can update their own trips" ON public.transport_trips;

-- 7. Role-Aware Read Policies
CREATE POLICY "Transporters can view their own trips" ON public.transport_trips
FOR SELECT USING (auth.uid() = transporter_id);

CREATE POLICY "Distributors can view relevant trips" ON public.transport_trips
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'distributor')
  AND (
    status IN ('AVAILABLE', 'MATCHED') OR 
    id IN (SELECT trip_id FROM public.pools WHERE created_by = auth.uid())
  )
);

CREATE POLICY "Government admins can view all trips" ON public.transport_trips
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'government_admin')
);

CREATE POLICY "Farmers can view assigned trips" ON public.transport_trips
FOR SELECT USING (
  id IN (
    SELECT p.trip_id FROM public.pools p
    JOIN public.pool_members pm ON p.id = pm.pool_id
    JOIN public.harvests h ON pm.harvest_id = h.id
    WHERE h.farmer_id = auth.uid()
  )
);

CREATE POLICY "Consumers can view relevant trips" ON public.transport_trips
FOR SELECT USING (
  id IN (
    SELECT trip_id FROM public.pools 
    WHERE requirement_id IN (SELECT id FROM public.bulk_requirements WHERE consumer_id = auth.uid())
  )
);

-- 8. Role-Aware Write Policies
CREATE POLICY "Transporters can insert their own trips" ON public.transport_trips
FOR INSERT WITH CHECK (
  auth.uid() = transporter_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'transporter')
);

CREATE POLICY "Transporters can update their own trips" ON public.transport_trips
FOR UPDATE USING (
  auth.uid() = transporter_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'transporter')
);

-- 9. Column-Level Update Protection (Prevent client capacity manipulation)
REVOKE UPDATE ON TABLE public.transport_trips FROM authenticated;
GRANT UPDATE (
  vehicle_type, origin, destination, primary_route, return_route, 
  departure_time, trip_type, status, standard_rate_per_trip, 
  discounted_backhaul_rate, saving_estimate
) ON TABLE public.transport_trips TO authenticated;

GRANT ALL ON TABLE public.transport_trips TO service_role;
GRANT SELECT, INSERT, DELETE ON TABLE public.transport_trips TO authenticated;

-- 10. Status Lifecycle Machine Protection (Prevents arbitrary client status jumps)
CREATE OR REPLACE FUNCTION public.check_trip_status_transition()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  CASE OLD.status
    WHEN 'AVAILABLE' THEN
      IF NEW.status NOT IN ('MATCHED', 'ASSIGNED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status transition from AVAILABLE to %', NEW.status;
      END IF;
    WHEN 'MATCHED' THEN
      IF NEW.status NOT IN ('AVAILABLE', 'ASSIGNED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status transition from MATCHED to %', NEW.status;
      END IF;
    WHEN 'ASSIGNED' THEN
      IF NEW.status NOT IN ('AVAILABLE', 'MATCHED', 'IN_TRANSIT', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status transition from ASSIGNED to %', NEW.status;
      END IF;
    WHEN 'IN_TRANSIT' THEN
      IF NEW.status NOT IN ('COMPLETED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status transition from IN_TRANSIT to %', NEW.status;
      END IF;
    WHEN 'COMPLETED' THEN
      RAISE EXCEPTION 'Cannot transition from COMPLETED';
    WHEN 'CANCELLED' THEN
      RAISE EXCEPTION 'Cannot transition from CANCELLED';
    ELSE
      RAISE EXCEPTION 'Unknown status: %', OLD.status;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_transport_trips_status ON public.transport_trips;
CREATE TRIGGER tr_transport_trips_status
  BEFORE UPDATE ON public.transport_trips
  FOR EACH ROW EXECUTE FUNCTION public.check_trip_status_transition();

-- 11. Secure RPC for atomic transport assignment
CREATE OR REPLACE FUNCTION public.assign_transport_trip_safely(p_pool_id UUID, p_trip_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_trip RECORD;
    v_pool RECORD;
    v_new_capacity NUMERIC;
    v_new_trip_status TEXT;
    v_caller_uid UUID;
    v_caller_role TEXT;
BEGIN
    v_caller_uid := auth.uid();
    IF v_caller_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller_uid;

    -- Lock the pool row
    SELECT * INTO v_pool FROM public.pools WHERE id = p_pool_id FOR UPDATE;
    IF v_pool IS NULL THEN
        RAISE EXCEPTION 'Pool not found';
    END IF;

    -- Verify Caller Ownership
    IF v_caller_role != 'government_admin' AND v_pool.created_by != v_caller_uid THEN
        RAISE EXCEPTION 'Not authorized to assign transport to this pool';
    END IF;

    -- Validate Pool State
    IF v_pool.status NOT IN ('forming', 'ready') THEN
        RAISE EXCEPTION 'Pool is not in a valid state for transport assignment (status: %)', v_pool.status;
    END IF;

    IF v_pool.trip_id IS NOT NULL THEN
        RAISE EXCEPTION 'Pool has already been assigned to a transport trip';
    END IF;

    IF v_pool.current_quantity_kg <= 0 THEN
        RAISE EXCEPTION 'Pool has no quantity to assign';
    END IF;

    -- Lock the trip row
    SELECT * INTO v_trip FROM public.transport_trips WHERE id = p_trip_id FOR UPDATE;
    IF v_trip IS NULL THEN
        RAISE EXCEPTION 'Trip not found';
    END IF;

    -- Validate Trip State
    IF v_trip.status NOT IN ('AVAILABLE', 'MATCHED') THEN
        RAISE EXCEPTION 'Trip is not available for assignment (status: %)', v_trip.status;
    END IF;

    -- Capacity and double-booking check
    IF v_trip.available_capacity_kg < v_pool.current_quantity_kg THEN
        RAISE EXCEPTION 'Insufficient transport capacity (available: %, required: %)', v_trip.available_capacity_kg, v_pool.current_quantity_kg;
    END IF;

    -- Calculate safely
    v_new_capacity := v_trip.available_capacity_kg - v_pool.current_quantity_kg;
    
    IF v_new_capacity <= 0 THEN
        v_new_trip_status := 'ASSIGNED';
    ELSE
        v_new_trip_status := 'MATCHED';
    END IF;

    -- Execute updates atomically
    UPDATE public.transport_trips 
    SET available_capacity_kg = v_new_capacity, status = v_new_trip_status
    WHERE id = p_trip_id;

    UPDATE public.pools
    SET trip_id = p_trip_id, status = 'locked'
    WHERE id = p_pool_id;

    RETURN json_build_object(
        'success', true, 
        'trip_id', p_trip_id, 
        'pool_id', p_pool_id, 
        'remaining_capacity', v_new_capacity,
        'new_trip_status', v_new_trip_status
    );
END;
$$;

-- 12. Strict Execution Permissions
REVOKE EXECUTE ON FUNCTION public.assign_transport_trip_safely(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_transport_trip_safely(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_transport_trip_safely(UUID, UUID) TO service_role;
