/** MEM UI 표시용 — 한국 표준시(KST) */
export const APP_TIMEZONE = "Asia/Seoul";

const compactFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((p) => p.type === type)?.value ?? "00";
}

const dateOnlyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
});

/** yy.mm.dd (KST) — 제조연월일 */
export function formatManufacturedDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const p = dateOnlyFormatter.formatToParts(d);
  return `${part(p, "year")}.${part(p, "month")}.${part(p, "day")}`;
}

/** yy.mm.dd hh:mm:ss (KST) */
export function formatCheckedAtCompact(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const p = compactFormatter.formatToParts(d);
  return `${part(p, "year")}.${part(p, "month")}.${part(p, "day")} ${part(p, "hour")}:${part(p, "minute")}:${part(p, "second")}`;
}

/** 장비 상세 점검 이력 등 (KST) */
export function formatDateTimeKorea(
  iso: string,
  options?: Pick<
    Intl.DateTimeFormatOptions,
    "month" | "day" | "hour" | "minute" | "second"
  >,
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: APP_TIMEZONE,
    month: options?.month ?? "short",
    day: options?.day ?? "numeric",
    hour: options?.hour ?? "2-digit",
    minute: options?.minute ?? "2-digit",
    second: options?.second ?? "2-digit",
    hour12: false,
  }).format(d);
}
