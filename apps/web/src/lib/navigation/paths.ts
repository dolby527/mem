export const APP_HOME = "/dashboard";
export const EQUIPMENTS_BASE = "/equipments";
export const EQUIPMENTS_GROUP_BASE = `${EQUIPMENTS_BASE}/group`;
export const MONITORING_BASE = "/monitoring";
export const MAINTENANCE_BASE = "/maintenance";

/** @deprecated `/equipments/group` 사용 */
export const DASHBOARD_EQUIPMENT_BASE = `${APP_HOME}/equipment`;

export function equipmentGroupPath(group: {
  category: string;
  name: string;
  statusSourceType: string;
}): string {
  const params = new URLSearchParams({
    category: group.category,
    name: group.name,
    source: group.statusSourceType,
  });
  return `${EQUIPMENTS_GROUP_BASE}?${params.toString()}`;
}

/** @deprecated equipmentGroupPath 사용 */
export const dashboardEquipmentGroupPath = equipmentGroupPath;

export function equipmentDetailPath(equipmentId: string): string {
  return `${MONITORING_BASE}/equipments/${encodeURIComponent(equipmentId)}`;
}

export function monitoringListPath(query?: Record<string, string | undefined>): string {
  if (!query) return MONITORING_BASE;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${MONITORING_BASE}?${qs}` : MONITORING_BASE;
}
