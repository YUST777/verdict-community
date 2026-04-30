-- 20260302_normalize_chat_persistence.sql
-- 
-- Extends the ai_conversations + ai_messages tables to support
-- full chat history persistence with per-tab conversations,
-- explicit message ordering, and optimized indexes.

-- 1. Add tab_id (client-side tab identifier) and title to ai_conversations
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS tab_id text NOT NULL DEFAULT 'default';
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS title text;

-- 2. Replace the old (user_id, problem_id) unique constraint with
--    (user_id, problem_id, tab_id) so each chat tab gets its own row
ALTER TABLE public.ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_user_id_problem_id_key;
ALTER TABLE public.ai_conversations ADD CONSTRAINT ai_conversations_user_problem_tab_key UNIQUE (user_id, problem_id, tab_id);

-- 3. Add ordinal (explicit ordering) and metadata (JSONB for rich fields) to ai_messages
ALTER TABLE public.ai_messages ADD COLUMN IF NOT EXISTS ordinal integer;
ALTER TABLE public.ai_messages ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- 4. Composite index for fast ordered message retrieval: O(log n) seek + O(k) sequential scan
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_ordinal ON public.ai_messages (conversation_id, ordinal);

-- 5. Composite index for fast user+problem lookup on conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_problem ON public.ai_conversations (user_id, problem_id);

-- 6. Backfill ordinal for any existing messages (based on created_at order)
WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at) as rn
    FROM public.ai_messages
    WHERE ordinal IS NULL
)
UPDATE public.ai_messages m
SET ordinal = n.rn
FROM numbered n
WHERE m.id = n.id;
