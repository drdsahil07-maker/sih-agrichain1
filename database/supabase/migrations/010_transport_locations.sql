-- =================================================================================
-- MIGRATION: Phase 9 - Live Transporter GPS & Tracking
-- =================================================================================

CREATE TABLE IF NOT EXISTS public.transport_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.transport_trips(id) ON DELETE CASCADE,
  transporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transport_locations_trip ON public.transport_locations(trip_id);
CREATE INDEX IF NOT EXISTS idx_transport_locations_transporter ON public.transport_locations(transporter_id);

ALTER TABLE public.transport_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Transporters can insert their own trip locations" ON public.transport_locations;
CREATE POLICY "Transporters can insert their own trip locations" ON public.transport_locations
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = transporter_id AND
    EXISTS (
      SELECT 1 FROM public.transport_trips t
      WHERE t.id = trip_id AND t.transporter_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Associated users can view trip locations" ON public.transport_locations;
CREATE POLICY "Associated users can view trip locations" ON public.transport_locations
  FOR SELECT TO authenticated
  USING (
    auth.uid() = transporter_id OR
    EXISTS (
      SELECT 1 FROM public.transport_trips t
      JOIN public.pools p ON p.trip_id = t.id
      JOIN public.harvests h ON h.pool_id = p.id
      WHERE t.id = trip_id AND h.farmer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.transport_trips t
      JOIN public.orders o ON o.transport_trip_id = t.id
      WHERE t.id = trip_id AND (o.buyer_id = auth.uid() OR o.consumer_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('government_admin', 'distributor')
    )
  );

GRANT ALL ON TABLE public.transport_locations TO service_role;
GRANT SELECT, INSERT ON TABLE public.transport_locations TO authenticated;
