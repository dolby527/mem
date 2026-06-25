import { Injectable } from "@nestjs/common";
import { EquipmentStatus, StatusSourceType } from "@prisma/client";

export interface StatusUpdateEvent {
  equipmentId: string;
  equipmentSlug: string;
  status: EquipmentStatus;
  checkedAt: string;
  statusSinceAt: string;
  statusResolvedFrom?: StatusSourceType;
  /** true면 상태 전환 — HealthCheckLog 생성·UI 이력 추가 */
  changed: boolean;
  logId?: string;
  latencyMs?: number | null;
  errorMessage?: string | null;
}

@Injectable()
export class MonitoringEventsService {
  private readonly listeners = new Map<
    string,
    Set<(event: StatusUpdateEvent) => void>
  >();

  subscribe(hospitalId: string, listener: (event: StatusUpdateEvent) => void) {
    let set = this.listeners.get(hospitalId);
    if (!set) {
      set = new Set();
      this.listeners.set(hospitalId, set);
    }
    set.add(listener);
    return () => {
      set?.delete(listener);
      if (set?.size === 0) this.listeners.delete(hospitalId);
    };
  }

  emit(hospitalId: string, event: StatusUpdateEvent) {
    this.listeners.get(hospitalId)?.forEach((listener) => listener(event));
  }
}
