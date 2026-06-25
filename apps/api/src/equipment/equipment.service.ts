import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, StatusSourceType } from "@prisma/client";
import type { HospitalScope } from "../common/hospital-scope.types";
import {
  generateIngestToken,
  hashAgentToken,
} from "../monitoring/ingest-token.util";
import { isAllowedFallback } from "../monitoring/vendor-event-mapping";
import { PrismaService } from "../prisma/prisma.service";
import { assertCreateLocation } from "./equipment-body.parser";
import { EquipmentImageStorage } from "./equipment-image.storage";
import { CreateEquipmentDto } from "./dto/create-equipment.dto";
import { UpdateEquipmentDto } from "./dto/update-equipment.dto";
import {
  HEALTH_CHECK_LOG_PAGE_SIZE,
  HEALTH_CHECK_LOG_PAGE_SIZE_MAX,
} from "./health-check-log.constants";

@Injectable()
export class EquipmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorage: EquipmentImageStorage,
  ) {}

  async findAll(scope: HospitalScope) {
    const rows = await this.prisma.equipment.findMany({
      where: { hospitalId: scope.hospitalId },
      orderBy: { name: "asc" },
    });

    return rows.map(({ agentTokenHash, ...equipment }) => {
      void agentTokenHash;
      return equipment;
    });
  }

  async findOneBySlug(scope: HospitalScope, equipmentSlug: string) {
    const row = await this.prisma.equipment.findFirst({
      where: { equipmentSlug, hospitalId: scope.hospitalId },
    });
    if (!row) {
      throw new NotFoundException(`Equipment not found: ${equipmentSlug}`);
    }
    const { agentTokenHash, ...rest } = row;
    void agentTokenHash;
    return rest;
  }

  async listHealthCheckLogs(
    scope: HospitalScope,
    equipmentSlug: string,
    options?: { cursor?: string; limit?: number },
  ) {
    const equipment = await this.prisma.equipment.findFirst({
      where: { equipmentSlug, hospitalId: scope.hospitalId },
      select: { id: true },
    });
    if (!equipment) {
      throw new NotFoundException(`Equipment not found: ${equipmentSlug}`);
    }

    const limit = Math.min(
      Math.max(options?.limit ?? HEALTH_CHECK_LOG_PAGE_SIZE, 1),
      HEALTH_CHECK_LOG_PAGE_SIZE_MAX,
    );

    const rows = await this.prisma.healthCheckLog.findMany({
      where: { equipmentId: equipment.id },
      orderBy: [{ checkedAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(options?.cursor
        ? { cursor: { id: options.cursor }, skip: 1 }
        : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return {
      items,
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
    };
  }

  async create(
    scope: HospitalScope,
    dto: CreateEquipmentDto,
    file?: Express.Multer.File,
  ) {
    this.validateSourceConfig(dto);
    assertCreateLocation(dto);
    if (!file && !dto.imageUrl?.trim()) {
      throw new BadRequestException("장비 이미지가 필요합니다.");
    }

    let imageUrl = dto.imageUrl?.trim() || undefined;
    const imageAlt = dto.imageAlt?.trim() || dto.name;
    let savedImageUrl: string | undefined;
    if (file) {
      savedImageUrl = await this.imageStorage.save(
        scope.hospitalId,
        dto.equipmentSlug,
        file,
      );
      imageUrl = savedImageUrl;
    }

    let agentTokenPlain: string | undefined;

    const needsAgent =
      dto.statusSourceType === StatusSourceType.AGENT ||
      dto.fallbackSourceType === StatusSourceType.AGENT;
    if (needsAgent) {
      agentTokenPlain = generateIngestToken();
    }

    try {
      const created = await this.prisma.equipment.create({
        data: {
          hospital: { connect: { id: scope.hospitalId } },
          equipmentSlug: dto.equipmentSlug,
          name: dto.name,
          category: dto.category,
          location: dto.location,
          spatialBuilding: dto.spatialBuilding,
          spatialFloor: dto.spatialFloor,
          spatialRoom: dto.spatialRoom,
          manufacturer: dto.manufacturer,
          model: dto.model,
          manufacturedAt: dto.manufacturedAt
            ? new Date(dto.manufacturedAt)
            : undefined,
          statusSourceType: dto.statusSourceType,
          fallbackSourceType: dto.fallbackSourceType,
          statusSourceTypeReason: dto.statusSourceTypeReason,
          vendorDeviceId: dto.vendorDeviceId,
          vendorInterfaceType: dto.vendorInterfaceType,
          currentStatus: dto.currentStatus,
          maintenanceStatus: dto.maintenanceStatus,
          pmScheduledAt: dto.pmScheduledAt
            ? new Date(dto.pmScheduledAt)
            : undefined,
          devProbeHost: dto.devProbeHost,
          iotIdleThresholdW: dto.iotIdleThresholdW,
          iotRunningThresholdW: dto.iotRunningThresholdW,
          imageUrl,
          imageAlt,
          notes: dto.notes,
          statusResolvedFrom: dto.statusSourceType,
          agentTokenHash: agentTokenPlain
            ? await hashAgentToken(agentTokenPlain)
            : undefined,
        },
      });
      const { agentTokenHash, ...safe } = created;
      void agentTokenHash;
      return {
        ...safe,
        ...(agentTokenPlain ? { agentTokenPlain } : {}),
      };
    } catch (e) {
      if (savedImageUrl) {
        await this.imageStorage.deleteByUrl(savedImageUrl);
      }
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException(
          `equipmentSlug or vendorDeviceId already exists: ${dto.equipmentSlug}`,
        );
      }
      throw e;
    }
  }

  async update(
    scope: HospitalScope,
    equipmentSlug: string,
    dto: UpdateEquipmentDto,
    file?: Express.Multer.File,
  ) {
    const existing = await this.findOneBySlug(scope, equipmentSlug);
    const merged = { ...existing, ...dto };
    this.validateSourceConfig(merged as CreateEquipmentDto);

    let imageUrl = dto.imageUrl;
    let imageAlt = dto.imageAlt;
    if (file) {
      const nextUrl = await this.imageStorage.save(
        scope.hospitalId,
        equipmentSlug,
        file,
      );
      await this.imageStorage.deleteByUrl(existing.imageUrl);
      imageUrl = nextUrl;
      imageAlt = dto.imageAlt?.trim() || existing.imageAlt || existing.name;
    }

    const updated = await this.prisma.equipment.update({
      where: { equipmentSlug },
      data: {
        ...dto,
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(imageAlt !== undefined ? { imageAlt } : {}),
        ...(dto.pmScheduledAt !== undefined
          ? { pmScheduledAt: dto.pmScheduledAt ? new Date(dto.pmScheduledAt) : null }
          : {}),
        ...(dto.manufacturedAt !== undefined
          ? {
              manufacturedAt: dto.manufacturedAt
                ? new Date(dto.manufacturedAt)
                : null,
            }
          : {}),
      },
    });
    const { agentTokenHash, ...safe } = updated;
    void agentTokenHash;
    return safe;
  }

  async regenerateAgentToken(scope: HospitalScope, equipmentSlug: string) {
    const row = await this.prisma.equipment.findFirst({
      where: { equipmentSlug, hospitalId: scope.hospitalId },
    });
    if (!row) {
      throw new NotFoundException(`Equipment not found: ${equipmentSlug}`);
    }
    const needsAgent =
      row.statusSourceType === StatusSourceType.AGENT ||
      row.fallbackSourceType === StatusSourceType.AGENT;
    if (!needsAgent) {
      throw new BadRequestException(
        "AGENT primary/fallback 장비만 토큰을 발급할 수 있습니다.",
      );
    }

    const agentTokenPlain = generateIngestToken();
    await this.prisma.equipment.update({
      where: { id: row.id },
      data: { agentTokenHash: await hashAgentToken(agentTokenPlain) },
    });
    return { equipmentSlug, agentTokenPlain };
  }

  async remove(scope: HospitalScope, equipmentSlug: string) {
    const existing = await this.findOneBySlug(scope, equipmentSlug);
    await this.imageStorage.deleteByUrl(existing.imageUrl);
    return this.prisma.equipment.delete({ where: { equipmentSlug } });
  }

  private validateSourceConfig(dto: CreateEquipmentDto) {
    if (
      dto.fallbackSourceType &&
      !isAllowedFallback(dto.fallbackSourceType)
    ) {
      throw new BadRequestException(
        "fallbackSourceType은 PING, AGENT, IOT_SENSOR만 가능합니다.",
      );
    }
    if (
      dto.fallbackSourceType &&
      dto.fallbackSourceType === dto.statusSourceType
    ) {
      throw new BadRequestException(
        "fallbackSourceType은 primary와 같을 수 없습니다.",
      );
    }
    if (
      dto.statusSourceType === StatusSourceType.INTERFACE_VENDOR &&
      !dto.vendorDeviceId?.trim()
    ) {
      throw new BadRequestException(
        "INTERFACE_VENDOR primary는 vendorDeviceId가 필요합니다.",
      );
    }
    if (
      dto.fallbackSourceType === StatusSourceType.PING &&
      !dto.devProbeHost?.trim()
    ) {
      // allowed when HEALTH_CHECK_SIMULATE=true at runtime
    }
  }
}
