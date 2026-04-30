-- 20260302_restore_ai_tracking_fix3.sql

CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id bigint REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    problem_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, problem_id)
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'sources')),
    content text NOT NULL,
    context_type text DEFAULT 'chat' CHECK (context_type IN ('chat', 'teach_me', 'video_explainer')),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversations"
ON public.ai_conversations FOR ALL USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

CREATE POLICY "Users can insert their own messages"
ON public.ai_messages FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.ai_conversations 
        WHERE id = public.ai_messages.conversation_id 
        AND user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
);

CREATE POLICY "Users can view their own messages"
ON public.ai_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.ai_conversations 
        WHERE id = public.ai_messages.conversation_id 
        AND user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
);
