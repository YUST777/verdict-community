#!/usr/bin/env bash
# One-command run: build and start the full Verdict stack (standalone Docker).
# Run from repo root: ./scripts/run-docker.sh

set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
    echo "No .env found. Copying .env.example to .env (set Supabase + DATABASE_URL for full functionality)."
    cp .env.example .env
fi

echo "Building and starting Verdict stack..."
docker compose up -d --build

echo ""
echo "Verdict is starting. Frontend: http://127.0.0.1:3002"
echo "Check status: docker compose ps   or   ./scripts/vcl status"
echo "Logs:         docker compose logs -f   or   ./scripts/vcl logs"
