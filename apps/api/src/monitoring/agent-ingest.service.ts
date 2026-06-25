import { BadRequestException, Injectable } from "@nestjs/common";
import { EquipmentStatus, StatusSourceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AgentReportDto } from "./dto/agent-report.dto";
import { StatusEngineService } from "./status-engine.service";

@Injectable()
export class AgentIngestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statusEngine: StatusEngineService,
  ) {}

  async report(equipmentId: string, dto: AgentReportDto) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) {
      throw new BadRequestException("Equipment not found");
    }

    const isAgentPrimary =
      equipment.statusSourceType === StatusSourceType.AGENT;
    const isAgentFallback =
      equipment.fallbackSourceType === StatusSourceType.AGENT;
    if (!isAgentPrimary && !isAgentFallback) {
      throw new BadRequestException(
        "이 장비는 AGENT primary/fallback이 아닙니다.",
      );
    }

    const occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();
    let nextStatus = dto.status;
    if (dto.errorCode && nextStatus === EquipmentStatus.IDLE) {
      nextStatus = EquipmentStatus.FAULT;
    }

    const sourceType = isAgentPrimary
      ? StatusSourceType.AGENT
      : StatusSourceType.AGENT;

    return this.statusEngine.applyStatus({
      equipment,
      nextStatus,
      sourceType,
      checkedAt: occurredAt,
      latencyMs: dto.latencyMs ?? null,
      errorMessage: dto.message ?? dto.errorCode ?? null,
      agentLastSeenAt: occurredAt,
    });
  }
}
