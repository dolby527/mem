import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  MaintenanceScheduleStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import type { HospitalScope } from "../common/hospital-scope.types";
import { PrismaService } from "../prisma/prisma.service";
import { BulkImportMaintenanceDto } from "./dto/bulk-import.dto";
import { BulkMaintenanceSchedulesDto } from "./dto/bulk-schedules.dto";
import { CreateMaintenanceScheduleDto } from "./dto/create-schedule.dto";
import { GenerateRecurrenceDto } from "./dto/generate-recurrence.dto";
import { UpdateMaintenanceScheduleDto } from "./dto/update-schedule.dto";
import { MaintenanceSyncService } from "./maintenance-sync.service";
import {
  generateRecurrenceDates,
  newRecurrenceGroupId,
  parseDateOnly,
  startOfUtcDay,
} from "./maintenance.util";

type AuthUser = {
  id: string;
  role: UserRole;
  hospitalId: string;
};

@Injectable()
export class MaintenanceSchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sync: MaintenanceSyncService,
  ) {}

  async list(
    scope: HospitalScope,
    query: {
      from?: string;
      to?: string;
      status?: MaintenanceScheduleStatus;
      equipmentSlug?: string;
    },
  ) {
    await this.sync.markOverdueSchedules(scope.hospitalId);

    const where: Prisma.MaintenanceScheduleWhereInput = {
      hospitalId: scope.hospitalId,
    };

    if (query.from || query.to) {
      where.scheduledDate = {};
      if (query.from) where.scheduledDate.gte = parseDateOnly(query.from);
      if (query.to) where.scheduledDate.lte = parseDateOnly(query.to);
    }
    if (query.status) where.status = query.status;
    if (query.equipmentSlug) {
      where.equipment = { equipmentSlug: query.equipmentSlug };
    }

    const rows = await this.prisma.maintenanceSchedule.findMany({
      where,
      orderBy: [{ scheduledDate: "asc" }, { createdAt: "asc" }],
      include: this.scheduleInclude(),
    });

    return rows.map((row) => this.mapSchedule(row));
  }

  async summary(scope: HospitalScope) {
    await this.sync.markOverdueSchedules(scope.hospitalId);
    const today = startOfUtcDay();

    const [scheduled, inProgress, overdue, upcomingWeek] = await Promise.all([
      this.prisma.maintenanceSchedule.count({
        where: {
          hospitalId: scope.hospitalId,
          status: MaintenanceScheduleStatus.SCHEDULED,
        },
      }),
      this.prisma.maintenanceSchedule.count({
        where: {
          hospitalId: scope.hospitalId,
          status: MaintenanceScheduleStatus.IN_PROGRESS,
        },
      }),
      this.prisma.maintenanceSchedule.count({
        where: {
          hospitalId: scope.hospitalId,
          status: MaintenanceScheduleStatus.OVERDUE,
        },
      }),
      this.prisma.maintenanceSchedule.count({
        where: {
          hospitalId: scope.hospitalId,
          status: {
            in: [
              MaintenanceScheduleStatus.SCHEDULED,
              MaintenanceScheduleStatus.IN_PROGRESS,
            ],
          },
          scheduledDate: {
            gte: today,
            lte: new Date(today.getTime() + 7 * 86400000),
          },
        },
      }),
    ]);

    return { scheduled, inProgress, overdue, upcomingWeek };
  }

  async createOne(
    scope: HospitalScope,
    user: AuthUser,
    dto: CreateMaintenanceScheduleDto,
  ) {
    const equipmentId = await this.sync.resolveEquipmentId(
      scope.hospitalId,
      dto.equipmentSlug,
    );
    const checklistSnapshot = await this.resolveChecklist(
      scope.hospitalId,
      dto,
    );

    const created = await this.prisma.maintenanceSchedule.create({
      data: {
        hospitalId: scope.hospitalId,
        equipmentId,
        maintenanceType: dto.maintenanceType,
        scheduledDate: parseDateOnly(dto.scheduledDate),
        assignedToUserId: dto.assignedToUserId,
        vendorEngineer: dto.vendorEngineer,
        estimatedHours: dto.estimatedHours,
        estimatedCost: dto.estimatedCost,
        checklistSnapshot:
          checklistSnapshot === undefined
            ? Prisma.JsonNull
            : (checklistSnapshot as Prisma.InputJsonValue),
        recurrenceGroupId: dto.recurrenceGroupId,
        recurrenceInterval: dto.recurrenceInterval ?? "NONE",
        createdByUserId: user.id,
        notes: dto.notes,
      },
      include: this.scheduleInclude(),
    });

    await this.sync.syncEquipmentPmFields(equipmentId);
    return this.mapSchedule(created);
  }

  async createBulk(
    scope: HospitalScope,
    user: AuthUser,
    dto: BulkMaintenanceSchedulesDto,
  ) {
    const created = [];
    for (const item of dto.schedules) {
      created.push(await this.createOne(scope, user, item));
    }
    return { count: created.length, schedules: created };
  }

  async generateRecurrence(
    scope: HospitalScope,
    user: AuthUser,
    dto: GenerateRecurrenceDto,
  ) {
    const slugs =
      dto.equipmentSlugs && dto.equipmentSlugs.length > 0
        ? dto.equipmentSlugs
        : [dto.equipmentSlug];

    const dates = generateRecurrenceDates(
      dto.scheduledDate,
      dto.rangeEndDate,
      dto.recurrenceInterval,
    );
    if (dates.length === 0) {
      throw new BadRequestException("생성할 일정이 없습니다.");
    }
    if (dates.length > 366) {
      throw new BadRequestException("한 번에 366건 이하만 생성할 수 있습니다.");
    }

    const groupId = newRecurrenceGroupId();
    const schedules: CreateMaintenanceScheduleDto[] = [];

    for (const equipmentSlug of slugs) {
      for (const scheduledDate of dates) {
        schedules.push({
          ...dto,
          equipmentSlug,
          scheduledDate,
          recurrenceGroupId: groupId,
          recurrenceInterval: dto.recurrenceInterval,
        });
      }
    }

    return this.createBulk(scope, user, { schedules });
  }

  async bulkImport(
    scope: HospitalScope,
    user: AuthUser,
    dto: BulkImportMaintenanceDto,
  ) {
    const templates = await this.prisma.maintenanceChecklistTemplate.findMany({
      where: { hospitalId: scope.hospitalId },
    });
    const templateByName = new Map(templates.map((t) => [t.name, t]));

    const schedules: CreateMaintenanceScheduleDto[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < dto.rows.length; i += 1) {
      const row = dto.rows[i];
      try {
        let assignedToUserId: string | undefined;
        if (row.assignedEmail?.trim()) {
          const assignee = await this.prisma.user.findFirst({
            where: {
              email: row.assignedEmail.trim(),
              hospitalId: scope.hospitalId,
            },
            select: { id: true },
          });
          if (!assignee) {
            throw new Error(`담당자 이메일 없음: ${row.assignedEmail}`);
          }
          assignedToUserId = assignee.id;
        }

        const template = row.templateCode
          ? templateByName.get(row.templateCode)
          : undefined;
        if (row.templateCode && !template) {
          throw new Error(`템플릿 없음: ${row.templateCode}`);
        }

        schedules.push({
          equipmentSlug: row.equipmentSlug,
          maintenanceType: row.maintenanceType,
          scheduledDate: row.scheduledDate,
          assignedToUserId,
          vendorEngineer: row.vendorEngineer,
          estimatedHours: row.estimatedHours,
          notes: row.notes,
          templateId: template?.id,
        });
      } catch (e) {
        errors.push({
          row: i + 1,
          message: e instanceof Error ? e.message : "알 수 없는 오류",
        });
      }
    }

    if (errors.length > 0 && schedules.length === 0) {
      throw new BadRequestException({ message: "일괄 등록 실패", errors });
    }

    const result = await this.createBulk(scope, user, { schedules });
    return { ...result, errors };
  }

  async update(
    scope: HospitalScope,
    user: AuthUser,
    id: string,
    dto: UpdateMaintenanceScheduleDto,
  ) {
    const existing = await this.findScoped(scope, id);
    this.assertCanModify(user, existing);

    const data: Prisma.MaintenanceScheduleUpdateInput = {};
    if (dto.scheduledDate !== undefined) {
      data.scheduledDate = parseDateOnly(dto.scheduledDate);
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === MaintenanceScheduleStatus.IN_PROGRESS) {
        data.startedAt = new Date();
      }
      if (dto.status === MaintenanceScheduleStatus.COMPLETED) {
        data.completedAt = new Date();
      }
    }
    if (dto.assignedToUserId !== undefined) {
      data.assignedTo = dto.assignedToUserId
        ? { connect: { id: dto.assignedToUserId } }
        : { disconnect: true };
    }
    if (dto.vendorEngineer !== undefined) data.vendorEngineer = dto.vendorEngineer;
    if (dto.estimatedHours !== undefined) data.estimatedHours = dto.estimatedHours;
    if (dto.estimatedCost !== undefined) data.estimatedCost = dto.estimatedCost;
    if (dto.notes !== undefined) data.notes = dto.notes;

    const updated = await this.prisma.maintenanceSchedule.update({
      where: { id },
      data,
      include: this.scheduleInclude(),
    });

    await this.sync.syncEquipmentPmFields(existing.equipmentId);
    return this.mapSchedule(updated);
  }

  async remove(scope: HospitalScope, user: AuthUser, id: string) {
    const existing = await this.findScoped(scope, id);
    this.assertCanModify(user, existing, true);

    await this.prisma.maintenanceSchedule.delete({ where: { id } });
    await this.sync.syncEquipmentPmFields(existing.equipmentId);
    return { ok: true };
  }

  private async findScoped(scope: HospitalScope, id: string) {
    const row = await this.prisma.maintenanceSchedule.findFirst({
      where: { id, hospitalId: scope.hospitalId },
    });
    if (!row) {
      throw new NotFoundException(`Maintenance schedule not found: ${id}`);
    }
    return row;
  }

  private assertCanModify(
    user: AuthUser,
    schedule: { assignedToUserId: string | null },
    adminOnly = false,
  ) {
    if (
      user.role === UserRole.HOSPITAL_ADMIN ||
      user.role === UserRole.PLATFORM_ADMIN
    ) {
      return;
    }
    if (adminOnly) {
      throw new ForbiddenException("병원 관리자만 삭제할 수 있습니다.");
    }
    if (schedule.assignedToUserId !== user.id) {
      throw new ForbiddenException("배정된 담당자 또는 관리자만 수정할 수 있습니다.");
    }
  }

  private async resolveChecklist(
    hospitalId: string,
    dto: CreateMaintenanceScheduleDto,
  ) {
    if (dto.checklistItems?.length) {
      return dto.checklistItems;
    }
    if (dto.templateId) {
      const template = await this.prisma.maintenanceChecklistTemplate.findFirst(
        {
          where: { id: dto.templateId, hospitalId },
        },
      );
      if (!template) {
        throw new NotFoundException(`Template not found: ${dto.templateId}`);
      }
      return template.items;
    }
    return undefined;
  }

  private scheduleInclude() {
    return {
      equipment: {
        select: {
          equipmentSlug: true,
          name: true,
          location: true,
          spatialBuilding: true,
          spatialFloor: true,
          spatialRoom: true,
          manufacturer: true,
          model: true,
        },
      },
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    } as const;
  }

  private mapSchedule(
    row: Prisma.MaintenanceScheduleGetPayload<{
      include: ReturnType<MaintenanceSchedulesService["scheduleInclude"]>;
    }>,
  ) {
    return {
      id: row.id,
      equipmentSlug: row.equipment.equipmentSlug,
      equipmentName: row.equipment.name,
      equipmentLocation: row.equipment.location,
      spatialBuilding: row.equipment.spatialBuilding,
      spatialFloor: row.equipment.spatialFloor,
      spatialRoom: row.equipment.spatialRoom,
      manufacturer: row.equipment.manufacturer,
      model: row.equipment.model,
      maintenanceType: row.maintenanceType,
      status: row.status,
      scheduledDate: row.scheduledDate.toISOString().slice(0, 10),
      startedAt: row.startedAt?.toISOString() ?? null,
      completedAt: row.completedAt?.toISOString() ?? null,
      assignedTo: row.assignedTo,
      vendorEngineer: row.vendorEngineer,
      estimatedHours: row.estimatedHours,
      estimatedCost: row.estimatedCost,
      checklistSnapshot: row.checklistSnapshot,
      recurrenceGroupId: row.recurrenceGroupId,
      recurrenceInterval: row.recurrenceInterval,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
