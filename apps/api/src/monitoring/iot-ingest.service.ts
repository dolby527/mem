import { BadRequestException, Injectable } from "@nestjs/common";
import { EquipmentStatus, StatusSourceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { IotReadingDto } from "./dto/iot-reading.dto";
import { StatusEngineService } from "./status-engine.service";

@Injectable()
export class IotIngestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statusEngine: StatusEngineService,
  ) {}

  async reading(equipmentId: string, dto: IotReadingDto) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) {
      throw new BadRequestException("Equipment not found");
    }

    const isIotPrimary =
      equipment.statusSourceType === StatusSourceType.IOT_SENSOR;
    const isIotFallback =
      equipment.fallbackSourceType === StatusSourceType.IOT_SENSOR;
    if (!isIotPrimary && !isIotFallback) {
      throw new BadRequestException(
        "이 장비는 IOT_SENSOR primary/fallback이 아닙니다.",
      );
    }

    const occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();
    const watts = dto.watts;
    const idleW = equipment.iotIdleThresholdW ?? 5;
    const runningW = equipment.iotRunningThresholdW ?? 50;

    let nextStatus: EquipmentStatus;
    if (watts <= 0) {
      nextStatus = EquipmentStatus.OFFLINE;
    } else if (watts >= runningW) {
      nextStatus = EquipmentStatus.RUNNING;
    } else if (watts <= idleW) {
      nextStatus = EquipmentStatus.IDLE;
    } else {
      nextStatus = EquipmentStatus.RUNNING;
    }

    return this.statusEngine.applyStatus({
      equipment,
      nextStatus,
      sourceType: StatusSourceType.IOT_SENSOR,
      checkedAt: occurredAt,
      errorMessage: dto.message ?? null,
      iotLastReadingW: watts,
      iotLastReadingAt: occurredAt,
    });
  }
}
