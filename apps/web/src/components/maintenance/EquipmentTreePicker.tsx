"use client";

import { useEffect, useMemo, useState } from "react";
import type { ApiEquipment } from "@/lib/api/equipment.api";
import {
  buildEquipmentTree,
  filterEquipmentTree,
  findEquipmentPath,
  type EquipmentTreeNode,
} from "@/lib/equipment/equipment-tree";
import * as s from "./EquipmentTreePicker.css";

function defaultExpanded(tree: EquipmentTreeNode[]): Set<string> {
  const ids = new Set<string>();
  for (const cat of tree) {
    ids.add(cat.id);
  }
  return ids;
}

interface TreeRowProps {
  node: EquipmentTreeNode;
  depth: number;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  selectedSlug?: string;
  selectedSlugs?: Set<string>;
  onSelectDevice?: (slug: string) => void;
  onToggleDevice?: (slug: string) => void;
  mode: "single" | "multiple";
  disabled?: boolean;
}

function TreeRow({
  node,
  depth,
  expanded,
  onToggleExpand,
  selectedSlug,
  selectedSlugs,
  onSelectDevice,
  onToggleDevice,
  mode,
  disabled,
}: TreeRowProps) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded = expanded.has(node.id);
  const isDevice = node.kind === "device";
  const isSelected =
    mode === "single"
      ? isDevice && node.equipmentSlug === selectedSlug
      : isDevice && node.equipmentSlug
        ? selectedSlugs?.has(node.equipmentSlug)
        : false;

  const handleRowClick = () => {
    if (disabled) return;
    if (isDevice && node.equipmentSlug) {
      if (mode === "single") {
        onSelectDevice?.(node.equipmentSlug);
      } else {
        onToggleDevice?.(node.equipmentSlug);
      }
      return;
    }
    if (hasChildren) onToggleExpand(node.id);
  };

  return (
    <li>
      <div
        className={s.treeRow({
          selected: Boolean(isSelected),
          kind: node.kind,
        })}
        style={{
          paddingLeft: `${6 + depth * 12}px`,
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            className={s.expandBtn}
            disabled={disabled}
            aria-label={isExpanded ? "접기" : "펼치기"}
            onClick={() => onToggleExpand(node.id)}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        ) : mode === "multiple" && isDevice ? (
          <input
            type="checkbox"
            className={s.checkbox}
            checked={Boolean(isSelected)}
            disabled={disabled}
            readOnly
            tabIndex={-1}
            aria-hidden
          />
        ) : (
          <span className={s.expandPlaceholder} />
        )}
        <button
          type="button"
          className={s.rowSelectBtn}
          disabled={disabled}
          onClick={handleRowClick}
        >
          <span className={s.rowContent}>
            <span className={s.rowLabel({ kind: node.kind })}>
              {node.kind === "device" ? `장비ID: ${node.label}` : node.label}
            </span>
            {node.sublabel ? (
              <span className={s.rowSublabel}>벤더 ID: {node.sublabel}</span>
            ) : null}
          </span>
        </button>
      </div>
      {hasChildren && isExpanded ? (
        <ul className={s.nestedList}>
          {node.children!.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              selectedSlug={selectedSlug}
              selectedSlugs={selectedSlugs}
              onSelectDevice={onSelectDevice}
              onToggleDevice={onToggleDevice}
              mode={mode}
              disabled={disabled}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

interface EquipmentTreePickerProps {
  equipment: ApiEquipment[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  disabled?: boolean;
}

export function EquipmentTreePicker({
  equipment,
  selectedSlug,
  onSelect,
  disabled,
}: EquipmentTreePickerProps) {
  const tree = useMemo(() => buildEquipmentTree(equipment), [equipment]);
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => filterEquipmentTree(tree, query),
    [tree, query],
  );
  const [expanded, setExpanded] = useState(() => defaultExpanded(tree));

  useEffect(() => {
    if (!selectedSlug) return;
    const path = findEquipmentPath(tree, selectedSlug);
    if (path.length === 0) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const id of path) next.add(id);
      return next;
    });
  }, [tree, selectedSlug]);

  useEffect(() => {
    if (query.trim()) {
      const ids = new Set<string>();
      function collectIds(nodes: EquipmentTreeNode[]) {
        for (const n of nodes) {
          ids.add(n.id);
          if (n.children) collectIds(n.children);
        }
      }
      collectIds(filtered);
      setExpanded(ids);
    }
  }, [query, filtered]);

  const selected = equipment.find((e) => e.equipmentSlug === selectedSlug);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={s.treeRoot}>
      <input
        type="search"
        className={s.searchInput}
        placeholder="분류·장비명·위치·장비ID 검색"
        value={query}
        disabled={disabled}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="장비 검색"
      />
      {selected ? (
        <p className={s.selectedSummary}>
          선택: {selected.name}
          <span className={s.selectedSlug}>{selected.equipmentSlug}</span>
        </p>
      ) : (
        <p className={s.selectedSummary}>장비를 선택하세요.</p>
      )}
      <div className={s.treePanel} role="tree" aria-label="장비 선택">
        {filtered.length === 0 ? (
          <p className={s.emptyHint}>검색 결과가 없습니다.</p>
        ) : (
          <ul className={s.treeList}>
            {filtered.map((node) => (
              <TreeRow
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                selectedSlug={selectedSlug}
                onSelectDevice={onSelect}
                mode="single"
                disabled={disabled}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface EquipmentTreeMultiPickerProps {
  equipment: ApiEquipment[];
  selectedSlugs: string[];
  onChange: (slugs: string[]) => void;
  excludeSlug?: string;
  disabled?: boolean;
}

export function EquipmentTreeMultiPicker({
  equipment,
  selectedSlugs,
  onChange,
  excludeSlug,
  disabled,
}: EquipmentTreeMultiPickerProps) {
  const tree = useMemo(() => buildEquipmentTree(equipment), [equipment]);
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => filterEquipmentTree(tree, query),
    [tree, query],
  );
  const [expanded, setExpanded] = useState(() => defaultExpanded(tree));
  const selectedSet = useMemo(() => new Set(selectedSlugs), [selectedSlugs]);

  useEffect(() => {
    if (query.trim()) {
      const ids = new Set<string>();
      function collectIds(nodes: EquipmentTreeNode[]) {
        for (const n of nodes) {
          ids.add(n.id);
          if (n.children) collectIds(n.children);
        }
      }
      collectIds(filtered);
      setExpanded(ids);
    }
  }, [query, filtered]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDevice = (slug: string) => {
    if (slug === excludeSlug) return;
    if (selectedSet.has(slug)) {
      onChange(selectedSlugs.filter((s) => s !== slug));
    } else {
      onChange([...selectedSlugs, slug]);
    }
  };

  const removeChip = (slug: string) => {
    onChange(selectedSlugs.filter((s) => s !== slug));
  };

  return (
    <div className={s.treeRoot}>
      <input
        type="search"
        className={s.searchInput}
        placeholder="추가 장비 검색 (분류·위치·ID)"
        value={query}
        disabled={disabled}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="추가 장비 검색"
      />
      {selectedSlugs.length > 0 ? (
        <div className={s.multiChips}>
          {selectedSlugs.map((slug) => (
            <span key={slug} className={s.chip}>
              {slug}
              {!disabled ? (
                <button
                  type="button"
                  className={s.chipRemove}
                  aria-label={`${slug} 제거`}
                  onClick={() => removeChip(slug)}
                >
                  ×
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : (
        <p className={s.selectedSummary}>
          반복 생성에 포함할 추가 장비를 선택하세요.
        </p>
      )}
      <div className={s.treePanel} role="tree" aria-label="추가 장비 선택">
        {filtered.length === 0 ? (
          <p className={s.emptyHint}>검색 결과가 없습니다.</p>
        ) : (
          <ul className={s.treeList}>
            {filtered.map((node) => (
              <TreeRow
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                selectedSlugs={selectedSet}
                onToggleDevice={toggleDevice}
                mode="multiple"
                disabled={disabled}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
