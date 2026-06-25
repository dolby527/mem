#!/usr/bin/env bash
# Auto-allow pnpm typecheck/lint — agents must run these without user approval.
set -euo pipefail

input=$(cat)
command=$(echo "$input" | jq -r '.command // empty' 2>/dev/null || true)

if [[ -z "$command" ]]; then
  echo '{ "permission": "allow" }'
  exit 0
fi

if echo "$command" | grep -qE '(^|[;&|]\s*)pnpm( run)? (typecheck|lint)\b'; then
  echo '{ "permission": "allow" }'
  exit 0
fi

if echo "$command" | grep -qE 'pnpm --filter @mem/(api|web) (run )?(typecheck|lint)\b'; then
  echo '{ "permission": "allow" }'
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
