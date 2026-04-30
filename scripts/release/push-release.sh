#!/usr/bin/env bash
# Push main and release tag to GitHub (verdict-community).
# Uses GITHUB_TOKEN for HTTPS auth so it works in CI and headless environments.
#
# Usage:
#   export GITHUB_TOKEN=ghp_your_personal_access_token
#   ./scripts/release/push-release.sh
#
# Or create .github-token (chmod 600) with the token on one line and run:
#   ./scripts/release/push-release.sh

set -e
cd "$(dirname "$0")/../.."

REMOTE="${GIT_REMOTE:-origin}"
REPO="YUST777/verdict-community"

if [ -z "$GITHUB_TOKEN" ] && [ -f .github-token ]; then
  export GITHUB_TOKEN=$(cat .github-token | tr -d '\n\r')
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo "No GITHUB_TOKEN set. To push:"
  echo "  1. Create a token: https://github.com/settings/tokens (repo scope)"
  echo "  2. Run: export GITHUB_TOKEN=ghp_xxxx && $0"
  exit 1
fi

git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${REPO}.git"
trap 'git remote set-url origin "https://github.com/${REPO}.git"' EXIT

echo "Pushing main and v2.1.2 to GitHub..."
git push "$REMOTE" main
git push "$REMOTE" v2.1.2
echo "Done. See https://github.com/${REPO}/releases"
git remote set-url origin "https://github.com/${REPO}.git"
trap - EXIT
