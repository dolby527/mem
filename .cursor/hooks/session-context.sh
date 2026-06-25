#!/usr/bin/env bash
# Inject MEM project reminders at session start.
set -euo pipefail

cat <<'EOF'
{
  "additional_context": "MEM monorepo: read AGENTS.md, docs/PROJECT.md, docs/MONITORING.md. Hospital-scoped data only. Never commit apps/*/env/.env.production. MANDATORY after ANY code change: run 'pnpm typecheck' then 'pnpm lint' from repo root BEFORE ending your turn. Do NOT ask the user for permission or confirmation. Do NOT say 'should I run typecheck?'. Just run it. See docs/CODE-QUALITY.md and .cursor/rules/code-quality-auto.mdc."
}
EOF

exit 0
