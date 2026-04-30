-- 20260302_cleanup_and_tts_limit.sql

-- Drop unused AI Tutor tables
DROP TABLE IF EXISTS public.ai_usage_logs;
DROP TABLE IF EXISTS public.ai_messages;
DROP TABLE IF EXISTS public.ai_conversations;
DROP TABLE IF EXISTS public.ai_user_preferences;
DROP TABLE IF EXISTS public.ai_user_subscriptions;
DROP TABLE IF EXISTS public.ai_user_usage_tracking;
DROP TABLE IF EXISTS public.password_resets;

-- Add tracking column for TTS videos
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tts_video_count integer DEFAULT 0;
