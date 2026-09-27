CREATE TABLE IF NOT EXISTS public.ai_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'calling',
  transcript TEXT,
  summary TEXT,
  structured_data JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.ai_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own AI calls" ON public.ai_calls
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own AI calls" ON public.ai_calls
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
