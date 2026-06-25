"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { TreeNode } from "@/lib/navigation/types";
import { monitoringListPath } from "@/lib/navigation/paths";
import * as s from "./NavigationTree.css";

interface LocationTreeProps {
  roots: TreeNode[];
}

function TreeBranch({
  node,
  selectedId,
  onSelect,
  defaultOpen,
}: {
  node: TreeNode;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  defaultOpen?: boolean;
}) {
  const hasChildren = node.children.length > 0;
  const isActive = selectedId === node.id;
  const isAncestor =
    selectedId != null &&
    (selectedId === node.id || selectedId.startsWith(`${node.id}/`));

  return (
    <li className={s.treeItem}>
      <button
        type="button"
        className={`${s.treeButton} ${isActive ? s.treeButtonActive : ""}`}
        style={{ paddingLeft: `${12 + node.depth * 14}px` }}
        onClick={() => onSelect(isActive ? null : node.id)}
      >
        <span
          className={`${s.treeChevron} ${!hasChildren ? s.treeChevronHidden : ""}`}
          aria-hidden
        >
          {defaultOpen || isAncestor ? "▾" : "▸"}
        </span>
        <span className={s.treeLabel}>{node.label}</span>
        <span className={s.treeCount}>{node.equipmentCount}</span>
      </button>
      {hasChildren && (defaultOpen || isAncestor) && (
        <ul className={s.nestedList}>
          {node.children.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              defaultOpen={child.depth < 2}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function LocationTree({ roots }: LocationTreeProps) {
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get("loc");

  function select(id: string | null) {
    router.push(
      monitoringListPath({
        view: params.get("view") ?? "spatial",
        loc: id ?? undefined,
        domain: params.get("domain") ?? undefined,
        sub: params.get("sub") ?? undefined,
        status: params.get("status") ?? undefined,
      }),
    );
  }

  return (
    <div className={s.panel}>
      <div className={s.panelHeader}>
        <p className={s.panelTitle}>위치 (건물 → 층 → 실)</p>
      </div>
      <div className={s.treeScroll}>
        <ul className={s.treeList}>
          {roots.map((root) => (
            <TreeBranch
              key={root.id}
              node={root}
              selectedId={selectedId}
              onSelect={select}
              defaultOpen
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
