# Code quality & lint

API/Web 변경 후 **커밋·배포 전** 아래를 실행합니다. (`AGENTS.md` Verification과 동일)

```bash
pnpm typecheck
pnpm lint
```

앱만 손댔을 때:

```bash
pnpm --filter @mem/api run typecheck
pnpm --filter @mem/api run lint
pnpm --filter @mem/api run build
```

## Agent / Cursor — 자동 검증 (필수)

코드·설정 파일을 수정한 작업의 **마무리 단계**는 아래를 **반드시** 따릅니다.

1. **사용자에게 묻지 않고** 레포 루트에서 `pnpm typecheck` 실행
2. 통과 후 **묻지 않고** `pnpm lint` 실행
3. 실패 시 원인 수정 후 1–2 **재실행** (통과할 때까지)
4. 수정한 파일에 대해 `read_lints`로 IDE 진단 확인

**금지:** "typecheck/lint 실행할까요?" 등 사용자 질문 · `AskQuestion` · 작업 완료 후 검증 생략.

### 에이전트 규칙

| 항목 | 규칙 |
|------|------|
| 실행 시점 | 코드 변경 작업 완료 직전 (커밋·PR 제안 전) |
| 사용자 확인 | `typecheck` / `lint` 실행 전 **요청하지 않음** |
| 명령 위치 | 가능하면 monorepo **루트** (`pnpm typecheck`, `pnpm lint`) |
| 실패 시 | 로그 확인 → 수정 → 재실행. "나중에 하겠다"고 남기지 않음 |
| 예외 | DB/Prisma만 손댄 경우에도 API 타입 영향 있으면 typecheck 포함 |

### Cursor 훅

`.cursor/hooks/allow-quality-checks.sh` — `beforeShellExecution`에서 `pnpm typecheck` / `pnpm lint` 계열 명령을 **자동 허용**합니다. 에이전트가 검증 명령 실행 시 사용자 승인 팝업을 띄우지 않도록 합니다.

clone 후:

```bash
chmod +x .cursor/hooks/*.sh
```

### 관련 설정

| 파일 | 역할 |
|------|------|
| `.cursor/rules/monorepo.mdc` | alwaysApply — 마무리 검증 필수 |
| `.cursor/skills/mem/SKILL.md` | MEM 기능 작업 시 동일 규칙 |
| `AGENTS.md` | Verification commands |
| `.cursor/hooks/session-context.sh` | 세션 시작 시 자동 검증 리마인더 |

## Agent / Cursor (레거시 참고)

- `.cursor/rules/api-nest.mdc`, `.cursor/rules/monitoring.mdc` 참고
