# Verdict 2.0 Directory Index & Subsystem Mapping

This document serves as the global map for the Verdict web application. If you are looking for a specific component, API, or system logic handler, use this index to find exactly where it lives.

---

## 🏗️ Table of Contents
1. Core Application Framework (`src/app/`)
2. Backend API Routes (`src/app/api/`)
3. Frontend UI Components (`src/components/`)
4. System Logic & Integration Hooks (`src/lib/` & `src/hooks/`)
5. Standalone Scripts (`scripts/`)

---

## 1. Core Application Framework (`src/app/`)
The primary Next.js App Router layout structuring the entire user experience. Next.js natively maps these folders to website URLs.

* **`/` (Root)** - The marketing landing page.
* **`/login`** - Authentication and gateway portal.
* **`/contest/[contestId]/problem/[problemId]`** - The **Mirror Mode Workspace**, acting as the main IDE environment for the user.
* **`/whiteboard/[...ids]`** - Standalone distraction-free excalidraw canvas routing.
* **`/about`, `/blog`, `/privacy`, `/terms`** - Static informational and policy pages.
* **`/community`, `/help`** - Automated redirect gateways to Telegram and Support Email respectively.

---

## 2. Backend API Routes (`src/app/api/`)
Contains all Next.js Serverless functions organizing backend behavior.

* **`/ai/`** - Proxy endpoints for custom user "Bring Your Own Key" LLM endpoints.
  * `/ai/chat` - Generates AI Tutor response streams.
* **`/auth/`** - Authentication system endpoints connecting via custom JWT or Supabase.
  * `/auth/check`, `/auth/login`, `/auth/register`
* **`/codeforces/`** - Dedicated scraper proxies to fetch Live Codeforces metadata (Standings, User info).
* **`/judge/`** - Engine interacting with the Judge0 Compiler cluster for code execution.
  * `/judge/submit` - Core execution.
  * `/judge/fuzz` - The "Invisible Fuzzer" endpoint testing hidden edge cases against a reference solution.
* **`/solutions/`** - **The Super Solution Engine**. Fetches Elite reference solutions seamlessly.
* **`/search/`** - Dedicated problem search integration endpoints.
* **`/workspace/`** - Supabase State persistence for Workspace code, whiteboard, custom test cases, and AI chat memory.
  * `/workspace/sync` - The primary bidirectional upsert hook.

---

## 3. Frontend UI Components (`src/components/`)
Highly categorized React UX components, divided by their primary scope to prevent root-folder clutter.

* **`core/`** - Foundational application wrappers (Providers, Extension Gates, Smooth Scroll).
* **`loaders/`** - Reusable visual loading Spinners and Suspense skeletons.
* **`shared/`** - Massive, heavy, specialized generic wrappers like the `ExcalidrawWrapper.tsx`.
* **`ui/`** - Minimal, generic Tailwind + Shadcn/ui building blocks (Buttons, Cards, Modals, Tooltips).
* **`auth/`** - Authentication-specific modal logic (`SignInModal.tsx`, `LocalToCloudSync.tsx`).
* **`landing/`** - The visual building blocks exclusive to the homepage (Hero sections, FAQs, Pricing).
* **`mirror/`** - The most critical sector: The Live IDE Workspace Environment.
  * `ai/` - `AIAgentPanel.tsx` and all prompt/chat logic.
  * `editor/` - The Code Mirror configuration (`CodeWorkspace.tsx`, `EditorToolbar.tsx`).
  * `problem/` - Rendering problem descriptions (Mathjax), constraints, and metadata.
  * `test/` - Specialized internal console panels for tracking live test execution outputs.
* **`trainer/`** - Dedicated experimental or gamified trainer module UI.

---

## 4. System Logic & Integration (`src/lib/` & `src/hooks/`)
Where heavy JavaScript algorithmic logic acts separated from visual React code.

### Handlers (`src/lib/`)
* **`judge.ts`** - Low-level Judge0 API execution and retry mechanisms.
* **`solutions.ts`** - Aggregation heuristics to fetch best-in-class C++ competitive reference code.
* **`json-utils.ts`** - Robust JSON regex recovery mechanisms to handle malformed LLM outputs.
* **`sessionData.tsx`** - Hardcoded competitive programming problem metadata and categories.

### React Hooks (`src/hooks/`)
* **`useTutorSession.ts`** - The primary brain orchestrating the entire AI workflow (generating thoughts, hitting the fuzzy judge endpoint, retrying logic errors automatically).
* **`useCodePersistence.ts`** - Bidirectional syncing pipeline mapping localStorage to Supabase Cloud memory.
* **`useAIChatPersistence.ts`** - Syncing pipeline handling Chat context limits across multi-device user environments.

---

## 5. Standalone Scripts (`scripts/`)
DevOps/Maintenance scripts completely removed from normal User Web Server execution.

* **Root** – `vcl` (developer CLI: `./scripts/vcl status`, `vcl logs`, `vcl rebuild`), `convert_images.py`.
* **`docker/`** – `run-docker.sh`, `nuke-icpchue.sh`, `nuke-logs.js`.
* **`migrate/`** – `migrate_rls.js`, `migrate_supabase.js`, `migrate_ai_chat.js`, `migrate_linter_fixes.js`, `fix_user_tabs_table.js`.
* **`release/`** – `push-release.sh` (push main and tag to GitHub with `GITHUB_TOKEN`).
* **`test/`** – Ad-hoc tests: `test_frontend.ts`, `test_google_tts.ts`, `test_new_tts_key.js`, `test_video_api.ts`, `test-renderer.js`, `test_trailing_slash.js`.
