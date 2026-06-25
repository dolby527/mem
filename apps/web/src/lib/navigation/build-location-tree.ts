import type { EquipmentWithHospital } from "../types";
import { inferSpatialPath, spatialNodeIds } from "./spatial";
import type { TreeNode } from "./types";

function upsertChild(
  parent: TreeNode,
  id: string,
  label: string,
  depth: number,
): TreeNode {
  let child = parent.children.find((c) => c.id === id);
  if (!child) {
    child = { id, label, depth, equipmentCount: 0, children: [] };
    parent.children.push(child);
  }
  return child;
}

export function buildLocationTree(
  items: EquipmentWithHospital[],
  hospitalNames: Map<string, string>,
): TreeNode[] {
  const roots: TreeNode[] = [];

  for (const item of items) {
    const spatial = inferSpatialPath(item);
    const ids = spatialNodeIds(spatial);
    const labels = [
      hospitalNames.get(spatial.hospitalSlug) ?? spatial.hospitalSlug,
      spatial.building,
      spatial.floor,
      spatial.room,
    ];

    let parent: TreeNode | undefined;

    for (let depth = 0; depth < 4; depth++) {
      const id = ids[depth];
      const label = labels[depth];
      if (depth === 0) {
        let root = roots.find((r) => r.id === id);
        if (!root) {
          root = { id, label, depth: 0, equipmentCount: 0, children: [] };
          roots.push(root);
        }
        parent = root;
      } else if (parent) {
        parent = upsertChild(parent, id, label, depth);
      }
      if (parent) parent.equipmentCount += 1;
    }
  }

  const sortNodes = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .map((n) => ({ ...n, children: sortNodes(n.children) }))
      .sort((a, b) => a.label.localeCompare(b.label, "ko"));

  return sortNodes(roots);
}

