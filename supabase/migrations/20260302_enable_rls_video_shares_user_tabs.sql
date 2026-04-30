-- 20260302_enable_rls_video_shares_user_tabs.sql

-- Enable RLS on video_shares table
ALTER TABLE public.video_shares ENABLE ROW LEVEL SECURITY;

-- Disable public access for video_shares (only our backend service role/postgres can read/write)
CREATE POLICY "Deny public access to video_shares"
  ON public.video_shares
  FOR ALL
  TO public
  USING (false);

-- Enable RLS on user_tabs table
ALTER TABLE public.user_tabs ENABLE ROW LEVEL SECURITY;

-- Disable public access for user_tabs (only our backend service role/postgres can read/write)
CREATE POLICY "Deny public access to user_tabs"
  ON public.user_tabs
  FOR ALL
  TO public
  USING (false);
