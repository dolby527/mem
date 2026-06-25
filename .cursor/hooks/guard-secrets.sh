#!/usr/bin/env bash
# Warn on risky git/shell commands for MEM repo.
set -euo pipefail

input=$(cat)
command=$(echo "$input" | jq -r '.command // empty' 2>/dev/null || true)

if [[ -z "$command" ]]; then
  echo '{ "permission": "allow" }'
  exit 0
fi

# Force push to main/master
if echo "$command" | grep -qE 'git push .*--force|git push -f'; then
  if echo "$command" | grep -qE 'main|master'; then
    echo '{
      "permission": "ask",
      "user_message": "Force push to main/master is blocked by project hook. Confirm only if you intend this.",
      "agent_message": "User must approve force push to protected branch."
    }'
    exit 0
  fi
fi

# Staging production env files
if echo "$command" | grep -qE 'git add.*env/\.env\.production|git commit.*\.env\.production'; then
  echo '{
    "permission": "ask",
    "user_message": "You may be committing apps/*/env/.env.production. Secrets must not go to git.",
    "agent_message": "Warn: production env files are gitignored for a reason."
  }'
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
