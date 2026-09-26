-- Migration: Create Harvests Table
-- This migration supports Phase 3: Core Database Persistence for Farmers

CREATE TABLE IF NOT EXISTS public.harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  crop TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  location TEXT NOT NULL,
  harvest_date DATE NOT NULL,
  selling_window TEXT NOT NULL,
  min_acceptable_price NUMERIC NOT NULL,
  quality_grade TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'compiled',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view compiled and open harvests"
  ON public.harvests FOR SELECT
  USING (status = 'compiled' OR auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert their own harvests"
  ON public.harvests FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update their own harvests"
  ON public.harvests FOR UPDATE
  USING (auth.uid() = farmer_id);

-- trigger for updated_at
DROP TRIGGER IF EXISTS tr_harvests_updated_at ON public.harvests;
CREATE TRIGGER tr_harvests_updated_at
  BEFORE UPDATE ON public.harvests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- index for queries
CREATE INDEX IF NOT EXISTS idx_harvests_farmer ON public.harvests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_harvests_status ON public.harvests(status);
