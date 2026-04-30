#!/bin/bash
# ============================================================================
# TEST MERGED DATABASE SETUP
# Target: Supabase project rytpfqlvzcfthnavybwx
# 
# Usage:
#   export TEST_DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
#   bash scripts/migrate/setup_test_db.sh
#
# This script:
# 1. Creates the merged schema (supports both ICPCHUE + Verdict users)
# 2. Seeds universities, curriculum, and achievements
# 3. Does NOT touch production databases
# ============================================================================

set -e

if [ -z "$TEST_DATABASE_URL" ]; then
    echo "ERROR: TEST_DATABASE_URL is not set."
    echo ""
    echo "Set it to your test Supabase project connection string:"
    echo "  export TEST_DATABASE_URL=\"postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres\""
    echo ""
    echo "Find it at: https://supabase.com/dashboard/project/rytpfqlvzcfthnavybwx/settings/database"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Setting up test merged database ==="
echo "Target: Supabase project rytpfqlvzcfthnavybwx"
echo ""

echo "[1/2] Running schema migration..."
psql "$TEST_DATABASE_URL" -f "$SCRIPT_DIR/001_test_merged_schema.sql"
echo "  ✓ Schema created"

echo "[2/2] Seeding data..."
psql "$TEST_DATABASE_URL" -f "$SCRIPT_DIR/002_test_seed_data.sql"
echo "  ✓ Data seeded (64 universities, 3 levels, 10 sheets, 24 achievements)"

echo ""
echo "=== Done! ==="
echo ""
echo "To use this test DB with Verdict, set in your .env:"
echo "  DATABASE_URL=\$TEST_DATABASE_URL"
echo ""
echo "Both ICPCHUE and Verdict users can now log in against this DB."
echo "ICPCHUE users: Supabase Auth (supabase_uid lookup)"
echo "Verdict users: JWT cookie (email_blind_index lookup)"
