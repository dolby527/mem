export type SidebarViewMode = "spatial" | "domain";

/** Depth: building → floor → room */
export interface SpatialPath {
  hospitalSlug: string;
  building: string;
  floor: string;
  room: string;
  /** URL-safe node id e.g. asan/본관/3층/핵의학과-pet */
  nodeId: string;
}

export interface DomainPath {
  domainId: string;
  subId: string;
}

export interface TreeNode {
  id: string;
  label: string;
  depth: number;
  equipmentCount: number;
  children: TreeNode[];
}

export interface DomainNode {
  id: string;
  label: string;
  equipmentCount: number;
  children: { id: string; label: string; equipmentCount: number }[];
}
