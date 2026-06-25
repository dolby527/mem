import type { EquipmentStatus, EquipmentWithHospital, MaintenanceStatus } from "../types";
import { domainNodeIds, resolveDomainPath } from "./domain";
import { inferSpatialPath, spatialNodeIds } from "./spatial";

export interface MonitoringFilters {
  loc?: string | null;
  domain?: string | null;
  sub?: string | null;
  /** 가동 상태 필터는 SSE 라이브 context 기준으로 클라이언트에서 적용 */
  status?: EquipmentStatus | "ALL";
  maintenance?: MaintenanceStatus | "ALL";
}

export function filterMonitoringEquipment(
  items: EquipmentWithHospital[],
  filters: MonitoringFilters,
): EquipmentWithHospital[] {
  let result = items;

  if (filters.loc) {
    result = result.filter((item) => matchesLoc(item, filters.loc!));
  }

  if (filters.domain) {
    result = result.filter((item) => {
      const path = resolveDomainPath(item);
      if (filters.sub) {
        return path.domainId === filters.domain && path.subId === filters.sub;
      }
      return path.domainId === filters.domain;
    });
  }

  if (filters.maintenance && filters.maintenance !== "ALL") {
    result = result.filter(
      (item) => item.maintenanceStatus === filters.maintenance,
    );
  }

  return result;
}

function matchesLoc(item: EquipmentWithHospital, locNodeId: string): boolean {
  const spatial = inferSpatialPath(item);
  const ids = spatialNodeIds(spatial);
  const depth = locNodeId.split("/").length;
  const prefix = ids[depth - 1];
  return prefix === locNodeId;
}

export function matchesDomainNode(
  item: EquipmentWithHospital,
  nodeId: string | null,
): boolean {
  if (!nodeId) return true;
  const path = resolveDomainPath(item);
  const ids = domainNodeIds(path);
  return ids.includes(nodeId) || ids[0] === nodeId;
}
