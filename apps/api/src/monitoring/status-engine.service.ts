import { Injectable, Logger } from "@nestjs/common";
import {
  Equipment,
  EquipmentStatus,
  StatusSourceType,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MonitoringEventsService } from "./monitoring-events.service";

export interface ApplyStatusInput {
  equipment: Equipment;
  nextStatus: EquipmentStatus;
  sourceType: StatusSourceType;
  checkedAt?: Date;
  latencyMs?: number | null;
  errorMessage?: string | null;
  vendorLastEventAt?: Date | null;
  agentLastSeenAt?: Date | null;
  iotLastReadingW?: number | null;
  iotLastReadingAt?: Date | null;
}

export interface ApplyStatusResult {
  equipmentSlug: string;
  status: EquipmentStatus;
  checkedAt: string;
  statusSinceAt: string;
  statusResolvedFrom: StatusSourceType;
  changed: boolean;
  logId?: string;
  latencyMs: number | null;
  errorMessage: string | null;
}

@Injectable()
export class StatusEngineService {
  private readonly logger = new Logger(StatusEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: MonitoringEventsService,
  ) {}

  async applyStatus(input: ApplyStatusInput): Promise<ApplyStatusResult> {
    const {
      equipment,
      nextStatus,
      sourceType,
      latencyMs = null,
      errorMessage = null,
    } = input;
    const checkedAt = input.checkedAt ?? new Date();
    const statusChanged = nextStatus !== equipment.currentStatus;
    const statusSinceAt = statusChanged
      ? checkedAt
      : equipment.currentStatusSinceAt;

    let logId: string | undefined;
    if (statusChanged) {
      const log = await this.prisma.healthCheckLog.create({
        data: {
          equipmentId: equipment.id,
          status: nextStatus,
          latencyMs,
          errorMessage,
          sourceType,
          checkedAt,
        },
      });
      logId = log.id;
      this.logger.log(
        `${equipment.equipmentSlug}: ${equipment.currentStatus} → ${nextStatus} (${sourceType})`,
      );
    }

    const updateData: {
      lastCheckedAt: Date;
      statusResolvedFrom: StatusSourceType;
      vendorLastEventAt?: Date;
      agentLastSeenAt?: Date;
      iotLastReadingW?: number;
      iotLastReadingAt?: Date;
      currentStatus?: EquipmentStatus;
      currentStatusSinceAt?: Date;
    } = {
      lastCheckedAt: checkedAt,
      statusResolvedFrom: sourceType,
    };

    if (input.vendorLastEventAt !== undefined && input.vendorLastEventAt) {
      updateData.vendorLastEventAt = input.vendorLastEventAt;
    }
    if (input.agentLastSeenAt !== undefined && input.agentLastSeenAt) {
      updateData.agentLastSeenAt = input.agentLastSeenAt;
    }
    if (input.iotLastReadingAt !== undefined && input.iotLastReadingAt) {
      updateData.iotLastReadingAt = input.iotLastReadingAt;
      if (input.iotLastReadingW != null) {
        updateData.iotLastReadingW = input.iotLastReadingW;
      }
    }

    if (statusChanged) {
      updateData.currentStatus = nextStatus;
      updateData.currentStatusSinceAt = checkedAt;
    }

    const updated = await this.prisma.equipment.update({
      where: { id: equipment.id },
      data: updateData,
    });

    const checkedAtIso = checkedAt.toISOString();
    const statusSinceIso = statusSinceAt.toISOString();
    const resolvedFrom = updated.statusResolvedFrom ?? sourceType;

    this.events.emit(equipment.hospitalId, {
      equipmentId: equipment.id,
      equipmentSlug: equipment.equipmentSlug,
      status: nextStatus,
      checkedAt: checkedAtIso,
      statusSinceAt: statusSinceIso,
      statusResolvedFrom: resolvedFrom,
      changed: statusChanged,
      logId,
      latencyMs,
      errorMessage,
    });

    return {
      equipmentSlug: equipment.equipmentSlug,
      status: nextStatus,
      checkedAt: checkedAtIso,
      statusSinceAt: statusSinceIso,
      statusResolvedFrom: resolvedFrom,
      changed: statusChanged,
      logId,
      latencyMs,
      errorMessage,
    };
  }
}
