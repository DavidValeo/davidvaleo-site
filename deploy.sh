#!/bin/sh
# Stage served files only into dist/ and deploy to Cloudflare Pages (davidvaleo-site.pages.dev, served at davidvaleo.com).
set -e
cd "$(dirname "$0")"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
git ls-files --cached --others --exclude-standard \
  | grep -v -E '^(\.claude/|tools/|tests/|inbox/|content/fixtures/|\.wrangler/)' \
  | grep -v -E '^(SPEC\.md|FORK-NOTES\.md|content/LORE\.md|\.gitignore|deploy\.sh)$' \
  | grep -v -E '(^|/)(\.DS_Store|__pycache__/)' \
  | while IFS= read -r f; do if [ -f "$f" ]; then printf '%s\n' "$f"; fi; done \
  > "$STAGE/list"  # skip files deleted but not yet committed
rm -rf dist && mkdir dist
rsync -a --files-from="$STAGE/list" ./ dist/
WRANGLER_SEND_METRICS=false npx -y wrangler@4 pages deploy dist --project-name davidvaleo-site --branch main
