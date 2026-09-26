-- Migration: Phase 5 Dynamic Pooling Engine
-- Purpose: Operational tables for persistent harvests and dynamic small-lot pooling.

-- 1. Helper function for timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Harvests (Persistent Produce)
-- Stores individual smallholder produce entries.
CREATE TABLE IF NOT EXISTS public.harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
  location TEXT NOT NULL,
  harvest_date DATE NOT NULL,
  selling_window TEXT NOT NULL,
  min_acceptable_price NUMERIC NOT NULL CHECK (min_acceptable_price >= 0),
  quality_grade TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'compiled', -- 'compiled', 'pending', 'pooled', 'sold'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS tr_harvests_updated_at ON public.harvests;
CREATE TRIGGER tr_harvests_updated_at
  BEFORE UPDATE ON public.harvests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Pools (Dynamic Aggregation)
-- Represents a consolidated commercial lot targeting a specific buyer requirement.
-- Note: requirement_id connects the pool directly to the existing bulk_requirements table.
CREATE TABLE IF NOT EXISTS public.pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_code TEXT UNIQUE NOT NULL,
  requirement_id UUID REFERENCES public.bulk_requirements(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quality_grade TEXT NOT NULL,
  target_quantity_kg NUMERIC NOT NULL CHECK (target_quantity_kg > 0),
  current_quantity_kg NUMERIC NOT NULL DEFAULT 0 CHECK (current_quantity_kg >= 0 AND current_quantity_kg <= target_quantity_kg),
  cluster_name TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'forming', -- 'forming', 'ready', 'locked', 'dispatched', 'completed'
  estimated_savings NUMERIC,
  match_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS tr_pools_updated_at ON public.pools;
CREATE TRIGGER tr_pools_updated_at
  BEFORE UPDATE ON public.pools
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Pool Members (Bridging Table)
-- Connects individual harvests to a consolidated pool.
-- farmer_id is intentionally omitted here to prevent ownership inconsistencies. 
-- The harvest owner is inherently the farmer associated with this membership.
CREATE TABLE IF NOT EXISTS public.pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  harvest_id UUID NOT NULL REFERENCES public.harvests(id) ON DELETE CASCADE,
  committed_quantity_kg NUMERIC NOT NULL CHECK (committed_quantity_kg > 0),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'removed'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS tr_pool_members_updated_at ON public.pool_members;
CREATE TRIGGER tr_pool_members_updated_at
  BEFORE UPDATE ON public.pool_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. Double-Booking Prevention
-- Ensures a single harvest can only be 'active' in ONE pool at a time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_harvest_pool 
ON public.pool_members(harvest_id) 
WHERE status = 'active';

-- 6. Trigger: Auto-calculate `current_quantity_kg` in `pools`
-- Runs as SECURITY DEFINER so that farmers/users mutating pool_members can bypass pools RLS
-- strictly for quantity aggregation, without granting them direct UPDATE on pools.
CREATE OR REPLACE FUNCTION update_pool_current_quantity()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
  -- Prevent changing pool_id after creation to maintain integrity
  IF TG_OP = 'UPDATE' AND OLD.pool_id != NEW.pool_id THEN
    RAISE EXCEPTION 'Cannot change pool_id of an existing pool membership.';
  END IF;

  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE public.pools SET current_quantity_kg = current_quantity_kg + NEW.committed_quantity_kg WHERE id = NEW.pool_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'active' AND NEW.status = 'active' THEN
      UPDATE public.pools SET current_quantity_kg = current_quantity_kg - OLD.committed_quantity_kg + NEW.committed_quantity_kg WHERE id = NEW.pool_id;
    ELSIF OLD.status = 'active' AND NEW.status = 'removed' THEN
      UPDATE public.pools SET current_quantity_kg = current_quantity_kg - OLD.committed_quantity_kg WHERE id = NEW.pool_id;
    ELSIF OLD.status = 'removed' AND NEW.status = 'active' THEN
      UPDATE public.pools SET current_quantity_kg = current_quantity_kg + NEW.committed_quantity_kg WHERE id = NEW.pool_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE public.pools SET current_quantity_kg = current_quantity_kg - OLD.committed_quantity_kg WHERE id = OLD.pool_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_pool_quantity ON public.pool_members;
CREATE TRIGGER tr_update_pool_quantity
  AFTER INSERT OR UPDATE OR DELETE ON public.pool_members
  FOR EACH ROW EXECUTE FUNCTION update_pool_current_quantity();

-- 7. Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_harvests_farmer ON public.harvests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_harvests_crop_quality ON public.harvests(crop, quality_grade);
CREATE INDEX IF NOT EXISTS idx_pools_status ON public.pools(status);
CREATE INDEX IF NOT EXISTS idx_pools_created_by ON public.pools(created_by);
CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON public.pool_members(pool_id);

-- 8. Row Level Security (RLS) Enablement
ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_members ENABLE ROW LEVEL SECURITY;

-- Harvests RLS (Idempotent policy creation)
DROP POLICY IF EXISTS "Farmers can insert their own harvests" ON public.harvests;
CREATE POLICY "Farmers can insert their own harvests" ON public.harvests FOR INSERT WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can update their own harvests" ON public.harvests;
CREATE POLICY "Farmers can update their own harvests" ON public.harvests FOR UPDATE USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can view their own harvests" ON public.harvests;
CREATE POLICY "Farmers can view their own harvests" ON public.harvests FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Anyone can view open harvests" ON public.harvests;
CREATE POLICY "Anyone can view open harvests" ON public.harvests FOR SELECT USING (status IN ('compiled', 'pending'));

-- Pools RLS (Idempotent policy creation)
DROP POLICY IF EXISTS "Anyone authenticated can view pools" ON public.pools;
CREATE POLICY "Anyone authenticated can view pools" ON public.pools FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Pool creators can insert pools" ON public.pools;
CREATE POLICY "Pool creators can insert pools" ON public.pools FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Pool creators can update their pools" ON public.pools;
CREATE POLICY "Pool creators can update their pools" ON public.pools FOR UPDATE USING (auth.uid() = created_by);

-- Pool Members RLS (Idempotent policy creation)
DROP POLICY IF EXISTS "Farmers can view memberships tied to their harvest" ON public.pool_members;
CREATE POLICY "Farmers can view memberships tied to their harvest" ON public.pool_members FOR SELECT 
USING (harvest_id IN (SELECT id FROM public.harvests WHERE farmer_id = auth.uid()));

DROP POLICY IF EXISTS "Pool creators can view memberships of their pools" ON public.pool_members;
CREATE POLICY "Pool creators can view memberships of their pools" ON public.pool_members FOR SELECT
USING (pool_id IN (SELECT id FROM public.pools WHERE created_by = auth.uid()));

DROP POLICY IF EXISTS "Pool creators can manage memberships of their pools" ON public.pool_members;
CREATE POLICY "Pool creators can manage memberships of their pools" ON public.pool_members FOR ALL
USING (pool_id IN (SELECT id FROM public.pools WHERE created_by = auth.uid()))
WITH CHECK (pool_id IN (SELECT id FROM public.pools WHERE created_by = auth.uid()));
