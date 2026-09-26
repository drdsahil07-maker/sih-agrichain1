-- Migration: Create Buyer Offers Table
-- This migration supports Phase 4: Buyer/Distributor Offers

CREATE TABLE IF NOT EXISTS public.buyer_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  harvest_id UUID NOT NULL REFERENCES public.harvests(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  offered_price NUMERIC NOT NULL,
  destination TEXT NOT NULL,
  pickup_terms TEXT NOT NULL DEFAULT 'Farmgate',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.buyer_offers ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own offers
CREATE POLICY "Buyers can view their own offers"
  ON public.buyer_offers FOR SELECT
  USING (auth.uid() = buyer_id);

-- Farmers can view offers for their harvests
CREATE POLICY "Farmers can view offers for their harvests"
  ON public.buyer_offers FOR SELECT
  USING (
    auth.uid() IN (
      SELECT farmer_id FROM public.harvests WHERE id = public.buyer_offers.harvest_id
    )
  );

-- Anyone authenticated can view ACTIVE offers (might be useful for market transparency) 
-- Wait, requirement says "A farmer can view offers relevant to their produce." Let's stick to strict visibility first.

-- Buyers can insert their own offers
CREATE POLICY "Buyers can insert their own offers"
  ON public.buyer_offers FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Buyers can update their own offers
CREATE POLICY "Buyers can update their own offers"
  ON public.buyer_offers FOR UPDATE
  USING (auth.uid() = buyer_id);

-- trigger for updated_at
DROP TRIGGER IF EXISTS tr_buyer_offers_updated_at ON public.buyer_offers;
CREATE TRIGGER tr_buyer_offers_updated_at
  BEFORE UPDATE ON public.buyer_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- index for queries
CREATE INDEX IF NOT EXISTS idx_buyer_offers_buyer ON public.buyer_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_offers_harvest ON public.buyer_offers(harvest_id);
CREATE INDEX IF NOT EXISTS idx_buyer_offers_status ON public.buyer_offers(status);
