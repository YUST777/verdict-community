-- 20260303_add_ai_code_to_conversations.sql

ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS ai_code text;
