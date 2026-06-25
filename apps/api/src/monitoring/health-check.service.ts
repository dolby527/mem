import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  Equipment,
  EquipmentStatus,
  StatusSourceType,
} from "@prisma/client";
import type { HospitalScope } from "../common/hospital-scope.types";
import { PrismaService } from "../prisma/prisma.service";
import { getMonitoringConfig } from "./monitoring.constants";
import { PingService } from "./ping.service";
import { StatusEngineService } from "./status-engine.service";
import {
  isAllowedFallback,
  isPrimaryVendorSource,
} from "./vendor-event-mapping";

export interface HealthCheckResult {
  equipmentSlug: string;
  status: EquipmentStatus;
  checkedAt: string;
  statusSinceAt: string;
  statusResolvedFrom: StatusSourceType;
  latencyMs: number | null;
  changed: boolean;
  logId: string | null;
  errorMessage: string | null;
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly config;
  private readonly batchOffsets = new Map<string, number>();
  private readonly pingFailures = new Map<string, number>();
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ping: PingService,
    private readonly statusEngine: StatusEngineService,
    configService: ConfigService,
  ) {
    this.config = getMonitoringConfig(configService);
  }

  async runBatch(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const hospitals = await this.prisma.hospital.findMany({
        select: { id: true },
      });
      for (const { id } of hospitals) {
        await this.runHospitalBatch(id);
      }
    } finally {
      this.running = false;
    }
  }

  private async runHospitalBatch(hospitalId: string): Promise<void> {
    const total = await this.prisma.equipment.count({ where: { hospitalId } });
    if (total === 0) return;

    let offset = this.batchOffsets.get(hospitalId) ?? 0;
    if (offset >= total) offset = 0;

    const batch = await this.prisma.equipment.findMany({
      where: { hospitalId },
      orderBy: { equipmentSlug: "asc" },
      skip: offset,
      take: this.config.healthCheckBatchSize,
    });

    const nextOffset = offset + batch.length;
    this.batchOffsets.set(hospitalId, nextOffset >= total ? 0 : nextOffset);

    for (const equipment of batch) {
      await this.evaluateEquipment(equipment);
    }
  }

  async recheckBySlug(
    scope: HospitalScope,
    equipmentSlug: string,
  ): Promise<HealthCheckResult> {
    const equipment = await this.prisma.equipment.findFirst({
      where: { equipmentSlug, hospitalId: scope.hospitalId },
    });
    if (!equipment) {
      throw new NotFoundException(`Equipment not found: ${equipmentSlug}`);
    }

    this.pingFailures.delete(equipment.id);
    const result = await this.evaluateEquipment(equipment, { force: true });
    if (!result) {
      throw new BadRequestException(
        "이 장비는 재확인 probe 설정이 없습니다.",
      );
    }
    return result;
  }

  private async evaluateEquipment(
    equipment: Equipment,
    options?: { force?: boolean },
  ): Promise<HealthCheckResult | null> {
    const force = options?.force ?? false;
    const checkedAt = new Date();

    if (isPrimaryVendorSource(equipment.statusSourceType)) {
      const vendorFresh = this.isVendorFresh(equipment, checkedAt);
      if (vendorFresh && !force) return null;
      if (vendorFresh && force) {
        return this.toHealthResult(
          await this.statusEngine.applyStatus({
            equipment,
            nextStatus: equipment.currentStatus,
            sourceType:
              equipment.statusResolvedFrom ??
              StatusSourceType.INTERFACE_VENDOR,
            checkedAt,
            vendorLastEventAt: equipment.vendorLastEventAt,
          }),
        );
      }
      if (equipment.fallbackSourceType) {
        return this.runFallbackProbe(equipment, checkedAt, force);
      }
      if (!vendorFresh) {
        return this.toHealthResult(
          await this.statusEngine.applyStatus({
            equipment,
            nextStatus: EquipmentStatus.OFFLINE,
            sourceType: StatusSourceType.INTERFACE_VENDOR,
            checkedAt,
            errorMessage: "인터페이스 이벤트 없음 (stale)",
          }),
        );
      }
      return null;
    }

    switch (equipment.statusSourceType) {
      case StatusSourceType.PING:
        return this.runPingProbe(equipment, checkedAt, force);
      case StatusSourceType.AGENT:
        return this.evaluateAgentStale(equipment, checkedAt, force);
      case StatusSourceType.IOT_SENSOR:
        return this.evaluateIotStale(equipment, checkedAt, force);
      default:
        return null;
    }
  }

  private async runFallbackProbe(
    equipment: Equipment,
    checkedAt: Date,
    force: boolean,
  ): Promise<HealthCheckResult | null> {
    const fallback = equipment.fallbackSourceType;
    if (!isAllowedFallback(fallback)) return null;

    switch (fallback) {
      case StatusSourceType.PING:
        return this.runPingProbe(equipment, checkedAt, force, true);
      case StatusSourceType.AGENT:
        return this.evaluateAgentStale(equipment, checkedAt, force);
      case StatusSourceType.IOT_SENSOR:
        return this.evaluateIotStale(equipment, checkedAt, force);
      default:
        return null;
    }
  }

  private async runPingProbe(
    equipment: Equipment,
    checkedAt: Date,
    force: boolean,
    isFallback = false,
  ): Promise<HealthCheckResult | null> {
    const host = equipment.devProbeHost?.trim();
    if (!host && !this.config.healthCheckSimulate) {
      if (!force) return null;
      throw new BadRequestException(
        "PING 호스트 또는 HEALTH_CHECK_SIMULATE가 필요합니다.",
      );
    }

    const probe = await this.resolveProbe(equipment);
    const nextStatus = this.derivePingStatus(equipment, probe.ok);
    const sourceType = isFallback
      ? StatusSourceType.PING
      : StatusSourceType.PING;

    return this.toHealthResult(
      await this.statusEngine.applyStatus({
        equipment,
        nextStatus,
        sourceType,
        checkedAt,
        latencyMs: probe.latencyMs,
        errorMessage: probe.errorMessage,
      }),
    );
  }

  private async evaluateAgentStale(
    equipment: Equipment,
    checkedAt: Date,
    force: boolean,
  ): Promise<HealthCheckResult | null> {
    if (this.isAgentFresh(equipment, checkedAt) && !force) return null;

    const sourceType = StatusSourceType.AGENT;

    if (this.isAgentFresh(equipment, checkedAt) && force) {
      return this.toHealthResult(
        await this.statusEngine.applyStatus({
          equipment,
          nextStatus: equipment.currentStatus,
          sourceType,
          checkedAt,
          agentLastSeenAt: equipment.agentLastSeenAt,
        }),
      );
    }

    return this.toHealthResult(
      await this.statusEngine.applyStatus({
        equipment,
        nextStatus: EquipmentStatus.OFFLINE,
        sourceType,
        checkedAt,
        errorMessage: "에이전트 하트비트 없음 (stale)",
      }),
    );
  }

  private async evaluateIotStale(
    equipment: Equipment,
    checkedAt: Date,
    force: boolean,
  ): Promise<HealthCheckResult | null> {
    if (this.isIotFresh(equipment, checkedAt) && !force) return null;

    const sourceType = StatusSourceType.IOT_SENSOR;

    if (this.isIotFresh(equipment, checkedAt) && force) {
      return this.toHealthResult(
        await this.statusEngine.applyStatus({
          equipment,
          nextStatus: equipment.currentStatus,
          sourceType,
          checkedAt,
          iotLastReadingAt: equipment.iotLastReadingAt,
          iotLastReadingW: equipment.iotLastReadingW,
        }),
      );
    }

    return this.toHealthResult(
      await this.statusEngine.applyStatus({
        equipment,
        nextStatus: EquipmentStatus.OFFLINE,
        sourceType,
        checkedAt,
        errorMessage: "IoT 센서 읽기 없음 (stale)",
      }),
    );
  }

  private isVendorFresh(equipment: Equipment, now: Date): boolean {
    if (!equipment.vendorLastEventAt) return false;
    return (
      now.getTime() - equipment.vendorLastEventAt.getTime() <
      this.config.interfaceVendorStaleMs
    );
  }

  private isAgentFresh(equipment: Equipment, now: Date): boolean {
    if (!equipment.agentLastSeenAt) return false;
    return (
      now.getTime() - equipment.agentLastSeenAt.getTime() <
      this.config.agentHeartbeatStaleMs
    );
  }

  private isIotFresh(equipment: Equipment, now: Date): boolean {
    if (!equipment.iotLastReadingAt) return false;
    return (
      now.getTime() - equipment.iotLastReadingAt.getTime() <
      this.config.iotReadingStaleMs
    );
  }

  private async resolveProbe(equipment: Equipment) {
    const host = equipment.devProbeHost?.trim();
    if (host) {
      return this.ping.ping(host, this.config.healthCheckTimeoutMs);
    }
    return this.ping.simulate(
      equipment.equipmentSlug,
      this.config.healthCheckIntervalMs,
    );
  }

  private derivePingStatus(equipment: Equipment, alive: boolean): EquipmentStatus {
    if (alive) {
      this.pingFailures.delete(equipment.id);
      return EquipmentStatus.IDLE;
    }

    const failures = (this.pingFailures.get(equipment.id) ?? 0) + 1;
    this.pingFailures.set(equipment.id, failures);

    if (failures >= this.config.pingFailureThreshold) {
      return EquipmentStatus.OFFLINE;
    }
    return equipment.currentStatus;
  }

  private toHealthResult(result: {
    equipmentSlug: string;
    status: EquipmentStatus;
    checkedAt: string;
    statusSinceAt: string;
    statusResolvedFrom: StatusSourceType;
    changed: boolean;
    logId?: string;
    latencyMs: number | null;
    errorMessage: string | null;
  }): HealthCheckResult {
    return {
      equipmentSlug: result.equipmentSlug,
      status: result.status,
      checkedAt: result.checkedAt,
      statusSinceAt: result.statusSinceAt,
      statusResolvedFrom: result.statusResolvedFrom,
      latencyMs: result.latencyMs,
      changed: result.changed,
      logId: result.logId ?? null,
      errorMessage: result.errorMessage,
    };
  }
}
