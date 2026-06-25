"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { monitoringListPath } from "@/lib/navigation/paths";
import type { SidebarViewMode } from "@/lib/navigation/types";
import * as s from "./ViewModeTabs.css";

export function ViewModeTabs() {
  const params = useSearchParams();
  const view = (params.get("view") ?? "spatial") as SidebarViewMode;

  function href(mode: SidebarViewMode) {
    return monitoringListPath({
      view: mode,
      loc: mode === "spatial" ? params.get("loc") ?? undefined : undefined,
      domain: mode === "domain" ? params.get("domain") ?? undefined : undefined,
      sub: mode === "domain" ? params.get("sub") ?? undefined : undefined,
      status: params.get("status") ?? undefined,
    });
  }

  return (
    <div className={s.tabs} role="tablist" aria-label="탐색 방식">
      <Link
        href={href("spatial")}
        className={`${s.tab} ${view === "spatial" ? s.tabActive : ""}`}
        role="tab"
        aria-selected={view === "spatial"}
      >
        위치
      </Link>
      <Link
        href={href("domain")}
        className={`${s.tab} ${view === "domain" ? s.tabActive : ""}`}
        role="tab"
        aria-selected={view === "domain"}
      >
        기능/품목
      </Link>
    </div>
  );
}
