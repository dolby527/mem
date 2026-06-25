"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DOMAIN_GROUPS } from "@/lib/navigation/domain";
import { monitoringListPath } from "@/lib/navigation/paths";
import { STATUS_LABELS } from "@/lib/status";
import { statusChip } from "@/styles/status.css";
import type { EquipmentStatus } from "@/lib/types";
import * as s from "./CategoryFilterBar.css";

const STATUSES: (EquipmentStatus | "ALL")[] = [
  "ALL",
  "RUNNING",
  "IDLE",
  "FAULT",
  "OFFLINE",
];

export function CategoryFilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const domain = params.get("domain") ?? "";
  const sub = params.get("sub") ?? "";
  const status = (params.get("status") ?? "ALL") as EquipmentStatus | "ALL";

  const subs = DOMAIN_GROUPS.find((g) => g.id === domain)?.subs ?? [];

  function navigate(patch: Record<string, string | undefined>) {
    router.push(
      monitoringListPath({
        view: params.get("view") ?? "spatial",
        loc: params.get("loc") ?? undefined,
        domain: params.get("domain") ?? undefined,
        sub: params.get("sub") ?? undefined,
        status: params.get("status") ?? undefined,
        ...patch,
      }),
    );
  }

  return (
    <div className={s.bar}>
      <p className={s.barTitle}>교차 필터 — 위치 트리 + 장비 종류</p>
      <div className={s.row}>
        <div className={s.fieldGroup}>
          <span className={s.label}>장비 대분류</span>
          <select
            className={s.select}
            value={domain}
            onChange={(e) => {
              navigate({
                domain: e.target.value || undefined,
                sub: undefined,
              });
            }}
          >
            <option value="">전체 대분류</option>
            {DOMAIN_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div className={s.fieldGroup}>
          <span className={s.label}>장비 소분류</span>
          <select
            className={s.select}
            value={sub}
            disabled={!domain}
            onChange={(e) => {
              navigate({ sub: e.target.value || undefined });
            }}
          >
            <option value="">전체 소분류</option>
            {subs.map((subItem) => (
              <option key={subItem.id} value={subItem.id}>
                {subItem.label}
              </option>
            ))}
          </select>
        </div>
        <div className={s.fieldGroup}>
          <span className={s.label}>가동 상태</span>
          <div className={s.statusRow}>
            {STATUSES.map((st) => (
              <Link
                key={st}
                href={monitoringListPath({
                  view: params.get("view") ?? "spatial",
                  loc: params.get("loc") ?? undefined,
                  domain: domain || undefined,
                  sub: sub || undefined,
                  status: st === "ALL" ? undefined : st,
                })}
                className={statusChip({
                  status: st,
                  size: "filter",
                  selected: status === st,
                })}
              >
                {st === "ALL" ? "전체" : STATUS_LABELS[st]}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <p className={s.hint}>
        좌측 트리에서 위치를 고르고, 여기서 장비 종류·상태를 겹쳐 필터링합니다.
      </p>
    </div>
  );
}
