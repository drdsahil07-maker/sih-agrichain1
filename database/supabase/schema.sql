-- ==============================================================================
-- AgriChain: Supabase Schema & Row-Level Security (RLS)
-- Connect. Trade. Deliver.
-- ==============================================================================

-- 1. Create Profiles Table (Base identity linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'distributor', 'transporter', 'consumer')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Create Farmer Profiles Table
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  village TEXT,
  district TEXT,
  state TEXT,
  crops TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Distributor Profiles Table
CREATE TABLE IF NOT EXISTS public.distributor_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  owner_name TEXT,
  business_type TEXT,
  city TEXT,
  state TEXT,
  crops_interested_in TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Transporter Profiles Table
CREATE TABLE IF NOT EXISTS public.transporter_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_number TEXT,
  vehicle_type TEXT,
  vehicle_capacity NUMERIC DEFAULT 0,
  current_location TEXT,
  preferred_routes TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Consumer Profiles Table (Bulk Buyers: Restaurants, Hotels, Canteens, Caterers, etc.)
CREATE TABLE IF NOT EXISTS public.consumer_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  owner_name TEXT,
  business_type TEXT,
  city TEXT,
  state TEXT,
  required_crops TEXT[] DEFAULT '{}'::TEXT[],
  typical_quantity NUMERIC DEFAULT 0,
  quantity_frequency TEXT DEFAULT 'KG / Day',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Bulk Requirements Table (Demands posted by bulk consumers)
CREATE TABLE IF NOT EXISTS public.bulk_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  variety TEXT,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  target_price NUMERIC,
  delivery_location TEXT NOT NULL,
  city TEXT,
  state TEXT,
  frequency TEXT NOT NULL DEFAULT 'one-time',
  quality_grade TEXT DEFAULT 'A Grade',
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_bulk_requirements_consumer ON public.bulk_requirements(consumer_id);
CREATE INDEX IF NOT EXISTS idx_bulk_requirements_status ON public.bulk_requirements(status);
CREATE INDEX IF NOT EXISTS idx_bulk_requirements_crop ON public.bulk_requirements(crop);

-- 8. Updated_at automated trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_farmer_profiles_updated_at ON public.farmer_profiles;
CREATE TRIGGER tr_farmer_profiles_updated_at
  BEFORE UPDATE ON public.farmer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_distributor_profiles_updated_at ON public.distributor_profiles;
CREATE TRIGGER tr_distributor_profiles_updated_at
  BEFORE UPDATE ON public.distributor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_transporter_profiles_updated_at ON public.transporter_profiles;
CREATE TRIGGER tr_transporter_profiles_updated_at
  BEFORE UPDATE ON public.transporter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_consumer_profiles_updated_at ON public.consumer_profiles;
CREATE TRIGGER tr_consumer_profiles_updated_at
  BEFORE UPDATE ON public.consumer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_bulk_requirements_updated_at ON public.bulk_requirements;
CREATE TRIGGER tr_bulk_requirements_updated_at
  BEFORE UPDATE ON public.bulk_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Enforce that users can only view and modify their own records.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transporter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_requirements ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Farmer Profiles Policies
DROP POLICY IF EXISTS "Users can view own farmer profile" ON public.farmer_profiles;
CREATE POLICY "Users can view own farmer profile"
  ON public.farmer_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own farmer profile" ON public.farmer_profiles;
CREATE POLICY "Users can insert own farmer profile"
  ON public.farmer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own farmer profile" ON public.farmer_profiles;
CREATE POLICY "Users can update own farmer profile"
  ON public.farmer_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Distributor Profiles Policies
DROP POLICY IF EXISTS "Users can view own distributor profile" ON public.distributor_profiles;
CREATE POLICY "Users can view own distributor profile"
  ON public.distributor_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own distributor profile" ON public.distributor_profiles;
CREATE POLICY "Users can insert own distributor profile"
  ON public.distributor_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own distributor profile" ON public.distributor_profiles;
CREATE POLICY "Users can update own distributor profile"
  ON public.distributor_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Transporter Profiles Policies
DROP POLICY IF EXISTS "Users can view own transporter profile" ON public.transporter_profiles;
CREATE POLICY "Users can view own transporter profile"
  ON public.transporter_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own transporter profile" ON public.transporter_profiles;
CREATE POLICY "Users can insert own transporter profile"
  ON public.transporter_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own transporter profile" ON public.transporter_profiles;
CREATE POLICY "Users can update own transporter profile"
  ON public.transporter_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Consumer Profiles Policies
DROP POLICY IF EXISTS "Users can view own consumer profile" ON public.consumer_profiles;
CREATE POLICY "Users can view own consumer profile"
  ON public.consumer_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own consumer profile" ON public.consumer_profiles;
CREATE POLICY "Users can insert own consumer profile"
  ON public.consumer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own consumer profile" ON public.consumer_profiles;
CREATE POLICY "Users can update own consumer profile"
  ON public.consumer_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Bulk Requirements Policies
DROP POLICY IF EXISTS "Anyone can view open bulk requirements" ON public.bulk_requirements;
CREATE POLICY "Anyone can view open bulk requirements"
  ON public.bulk_requirements FOR SELECT
  USING (status = 'open' OR auth.uid() = consumer_id);

DROP POLICY IF EXISTS "Consumers can insert own bulk requirements" ON public.bulk_requirements;
CREATE POLICY "Consumers can insert own bulk requirements"
  ON public.bulk_requirements FOR INSERT
  WITH CHECK (auth.uid() = consumer_id);

DROP POLICY IF EXISTS "Consumers can update own bulk requirements" ON public.bulk_requirements;
CREATE POLICY "Consumers can update own bulk requirements"
  ON public.bulk_requirements FOR UPDATE
  USING (auth.uid() = consumer_id);

DROP POLICY IF EXISTS "Consumers can delete own bulk requirements" ON public.bulk_requirements;
CREATE POLICY "Consumers can delete own bulk requirements"
  ON public.bulk_requirements FOR DELETE
  USING (auth.uid() = consumer_id);
