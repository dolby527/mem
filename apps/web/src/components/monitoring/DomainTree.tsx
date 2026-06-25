"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { DomainNode } from "@/lib/navigation/types";
import { monitoringListPath } from "@/lib/navigation/paths";
import * as s from "./NavigationTree.css";

interface DomainTreeProps {
  nodes: DomainNode[];
}

export function DomainTree({ nodes }: DomainTreeProps) {
  const router = useRouter();
  const params = useSearchParams();
  const domain = params.get("domain");
  const sub = params.get("sub");
  const selectedId = sub ? `${domain}/${sub}` : domain;

  function selectDomain(id: string | null, subId?: string) {
    router.push(
      monitoringListPath({
        view: "domain",
        domain: id ?? undefined,
        sub: subId,
        loc: params.get("loc") ?? undefined,
        status: params.get("status") ?? undefined,
      }),
    );
  }

  return (
    <div className={s.panel}>
      <div className={s.panelHeader}>
        <p className={s.panelTitle}>기능/품목 (대분류 → 소분류)</p>
      </div>
      <div className={s.treeScroll}>
        <ul className={s.treeList}>
          {nodes.map((group) => {
            const groupActive = domain === group.id && !sub;
            const groupOpen = domain === group.id;
            return (
              <li key={group.id} className={s.treeItem}>
                <button
                  type="button"
                  className={`${s.treeButton} ${groupActive ? s.treeButtonActive : ""}`}
                  onClick={() =>
                    selectDomain(groupActive ? null : group.id)
                  }
                >
                  <span className={s.treeChevron} aria-hidden>
                    {groupOpen ? "▾" : "▸"}
                  </span>
                  <span className={s.treeLabel}>{group.label}</span>
                  <span className={s.treeCount}>{group.equipmentCount}</span>
                </button>
                {groupOpen && (
                  <ul className={s.nestedList}>
                    {group.children.map((child) => {
                      const active = selectedId === child.id;
                      const [d, su] = child.id.split("/");
                      return (
                        <li key={child.id} className={s.treeItem}>
                          <button
                            type="button"
                            className={`${s.treeButton} ${active ? s.treeButtonActive : ""}`}
                            style={{ paddingLeft: "36px" }}
                            onClick={() => {
                              if (active) {
                                selectDomain(d, undefined);
                              } else {
                                selectDomain(d, su);
                              }
                            }}
                          >
                            <span
                              className={`${s.treeChevron} ${s.treeChevronHidden}`}
                            />
                            <span className={s.treeLabel}>{child.label}</span>
                            <span className={s.treeCount}>
                              {child.equipmentCount}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
