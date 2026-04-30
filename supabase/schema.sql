-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.login_logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint,
  ip_address text,
  user_agent text,
  logged_in_at timestamp with time zone DEFAULT now(),
  CONSTRAINT login_logs_pkey PRIMARY KEY (id),
  CONSTRAINT login_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.mirror_problems (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  contest_id text NOT NULL,
  problem_index text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mirror_problems_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mirror_views (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  contest_id text NOT NULL,
  problem_index text NOT NULL,
  user_id bigint,
  viewed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mirror_views_pkey PRIMARY KEY (id),
  CONSTRAINT mirror_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.password_resets (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT password_resets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.problem_test_cases (
  id integer NOT NULL DEFAULT nextval('problem_test_cases_id_seq'::regclass),
  sheet_id text NOT NULL,
  problem_id text NOT NULL,
  input text NOT NULL,
  expected_output text NOT NULL,
  is_sample boolean DEFAULT false,
  is_hidden boolean DEFAULT false,
  ordinal integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT problem_test_cases_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_achievements (
  id integer NOT NULL DEFAULT nextval('user_achievements_id_seq'::regclass),
  user_id bigint,
  achievement_id text NOT NULL,
  earned_at timestamp with time zone DEFAULT now(),
  seen boolean DEFAULT false,
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  profile_picture_url text,
  telegram_username text,
  codeforces_data jsonb,
  codeforces_handle text,
  email_blind_index text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
