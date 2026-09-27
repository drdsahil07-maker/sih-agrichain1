CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER,
  page_context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_role ON public.user_feedback(role);
CREATE INDEX IF NOT EXISTS idx_user_feedback_category ON public.user_feedback(category);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Authenticated users can insert their own feedback
CREATE POLICY "Users can insert their own feedback" ON public.user_feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own feedback
CREATE POLICY "Users can view their own feedback" ON public.user_feedback
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Government/Admin can view all feedback
CREATE POLICY "Admins can view all feedback" ON public.user_feedback
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'government_admin'
    )
  );
