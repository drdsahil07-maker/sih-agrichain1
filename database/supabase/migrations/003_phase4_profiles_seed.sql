-- Migration: Seed Demo Profiles and Verify Foreign Keys
-- Phase 4: Core Authentication & Database Gateway
-- Idempotent script for Supabase SQL Editor

-- 1. Insert into auth.users (enables both Supabase Auth login and satisfies profiles FK)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  'f1111111-1111-4111-8111-111111111111',
  'authenticated',
  'authenticated',
  'farmer@agrichain.com',
  crypt('Farmer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"farmer","full_name":"Ramesh Patel (Farmer)"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'd2222222-2222-4222-8222-222222222222',
  'authenticated',
  'authenticated',
  'distributor@agrichain.com',
  crypt('Distributor123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"distributor","full_name":"Kisan Agro Mandi Traders"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated',
  'authenticated',
  'transporter@agrichain.com',
  crypt('Transporter123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"transporter","full_name":"Malwa Express Logistics"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'consumer@agrichain.com',
  crypt('Consumer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"consumer","full_name":"Taj Fresh Caterers & Bulk Kitchens"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- 2. Insert into public.profiles
INSERT INTO public.profiles (id, full_name, email, role, phone)
VALUES (
  'f1111111-1111-4111-8111-111111111111',
  'Ramesh Patel (Farmer)',
  'farmer@agrichain.com',
  'farmer',
  '+91 98260 12345'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone;

INSERT INTO public.profiles (id, full_name, email, role, phone)
VALUES (
  'd2222222-2222-4222-8222-222222222222',
  'Kisan Agro Mandi Traders',
  'distributor@agrichain.com',
  'distributor',
  '+91 98260 23456'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone;

INSERT INTO public.profiles (id, full_name, email, role, phone)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Malwa Express Logistics',
  'transporter@agrichain.com',
  'transporter',
  '+91 98260 34567'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone;

INSERT INTO public.profiles (id, full_name, email, role, phone)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Taj Fresh Caterers & Bulk Kitchens',
  'consumer@agrichain.com',
  'consumer',
  '+91 98260 45678'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone;

-- 3. Insert Farmer & Distributor specific profile details
INSERT INTO public.farmer_profiles (id, village, district, state, crops)
VALUES (
  'f1111111-1111-4111-8111-111111111111',
  'Sanwer',
  'Indore',
  'Madhya Pradesh',
  ARRAY['Tomato', 'Wheat', 'Soybean']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.distributor_profiles (id, business_name, owner_name, business_type, city, state, crops_interested_in)
VALUES (
  'd2222222-2222-4222-8222-222222222222',
  'Kisan Agro Mandi Traders',
  'Suresh Gupta',
  'Wholesale Trader',
  'Indore',
  'Madhya Pradesh',
  ARRAY['Tomato', 'Onion', 'Potato']
)
ON CONFLICT (id) DO NOTHING;

