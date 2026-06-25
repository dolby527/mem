export const SSE_RETRY_MS = Number(
  process.env.NEXT_PUBLIC_SSE_RETRY_MS ?? 3_000,
);

/** 장비 상세 점검 이력 — 초기·더 보기 1회 조회 건수 */
export const HEALTH_CHECK_HISTORY_PAGE_SIZE = 5;
