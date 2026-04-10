#!/bin/bash
# tips.md → GitHub Pages 同期スクリプト
# .company/operations/tips.md を変換してpush
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# tips.md → tips.json
python3 build.py

# git commit & push (差分がある場合のみ)
cd docs
if git diff --quiet tips.json 2>/dev/null; then
  echo "No changes in tips.json"
  exit 0
fi

cd "$SCRIPT_DIR"
git add docs/tips.json
git commit -m "update tips $(date +%Y-%m-%d)"
git push origin main
echo "✅ Tips synced to GitHub Pages"
