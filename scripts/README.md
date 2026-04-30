# Scripts

Scripts are grouped by purpose. Run from the **repository root** unless noted.

## Root

- **`vcl`** – Developer CLI. Usage: `./scripts/vcl status`, `./scripts/vcl logs`, `./scripts/vcl rebuild`, `./scripts/vcl help`.
- **`convert_images.py`** – Image conversion utility (run with Python).

## docker/

- **`run-docker.sh`** – Build and start the full Verdict stack: `./scripts/docker/run-docker.sh`.
- **`nuke-icpchue.sh`** – One-off rename of "icpchue" → "verdict" across the repo.
- **`nuke-logs.js`** – Strip `console.log` from app/lib/components (run from repo root; expects `process.cwd()` to have those dirs).

## migrate/

Database migrations and one-off fixes. Set `DATABASE_URL` (e.g. via `.env` at repo root or `dotenv`).

- **`migrate_rls.js`** – Apply Supabase Row Level Security policies.
- **`migrate_supabase.js`** – Legacy migration to unified Supabase schema.
- **`migrate_ai_chat.js`**, **`migrate_linter_fixes.js`** – Schema/data migrations.
- **`fix_user_tabs_table.js`** – Fix `user_tabs` table schema (loads `.env` from repo root).

## release/

- **`push-release.sh`** – Push `main` and release tag to GitHub. Requires `GITHUB_TOKEN` or `.github-token` at repo root. Usage: `./scripts/release/push-release.sh`.

## test/

Ad-hoc test/runner scripts (not the main test suite):

- **`test_frontend.ts`**, **`test_video_api.ts`**, **`test_google_tts.ts`**, **`test_new_tts_key.js`** – API/local service checks.
- **`test-renderer.js`** – Remotion renderer load check.
- **`test_trailing_slash.js`** – JSON utils test (run with Node from repo root).
