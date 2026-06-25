import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { MaintenanceScheduleStatus } from "@prisma/client";
import { EquipmentManageGuard } from "../auth/equipment-manage.guard";
import { CurrentUser, type RequestUser } from "../common/decorators/current-user.decorator";
import { HospitalCtx } from "../common/decorators/hospital-scope.decorator";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import type { HospitalScope } from "../common/hospital-scope.types";
import { BulkImportMaintenanceDto } from "./dto/bulk-import.dto";
import { BulkMaintenanceSchedulesDto } from "./dto/bulk-schedules.dto";
import {
  CreateMaintenanceTemplateDto,
  UpdateMaintenanceTemplateDto,
} from "./dto/create-template.dto";
import { CreateMaintenanceScheduleDto } from "./dto/create-schedule.dto";
import { GenerateRecurrenceDto } from "./dto/generate-recurrence.dto";
import { UpdateMaintenanceScheduleDto } from "./dto/update-schedule.dto";
import { MaintenanceSchedulesService } from "./maintenance-schedules.service";
import { MaintenanceTemplatesService } from "./maintenance-templates.service";

@Controller("maintenance")
@UseGuards(HospitalScopeGuard)
export class MaintenanceController {
  constructor(
    private readonly schedules: MaintenanceSchedulesService,
    private readonly templates: MaintenanceTemplatesService,
  ) {}

  @Get("schedules/summary")
  summary(@HospitalCtx() scope: HospitalScope) {
    return this.schedules.summary(scope);
  }

  @Get("schedules")
  listSchedules(
    @HospitalCtx() scope: HospitalScope,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("status") status?: MaintenanceScheduleStatus,
    @Query("equipmentSlug") equipmentSlug?: string,
  ) {
    return this.schedules.list(scope, { from, to, status, equipmentSlug });
  }

  @Post("schedules")
  @UseGuards(EquipmentManageGuard)
  createSchedule(
    @HospitalCtx() scope: HospitalScope,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateMaintenanceScheduleDto,
  ) {
    return this.schedules.createOne(scope, user, dto);
  }

  @Post("schedules/bulk")
  @UseGuards(EquipmentManageGuard)
  bulkCreate(
    @HospitalCtx() scope: HospitalScope,
    @CurrentUser() user: RequestUser,
    @Body() dto: BulkMaintenanceSchedulesDto,
  ) {
    return this.schedules.createBulk(scope, user, dto);
  }

  @Post("schedules/generate-recurrence")
  @UseGuards(EquipmentManageGuard)
  generateRecurrence(
    @HospitalCtx() scope: HospitalScope,
    @CurrentUser() user: RequestUser,
    @Body() dto: GenerateRecurrenceDto,
  ) {
    return this.schedules.generateRecurrence(scope, user, dto);
  }

  @Post("schedules/bulk-import")
  @UseGuards(EquipmentManageGuard)
  bulkImport(
    @HospitalCtx() scope: HospitalScope,
    @CurrentUser() user: RequestUser,
    @Body() dto: BulkImportMaintenanceDto,
  ) {
    return this.schedules.bulkImport(scope, user, dto);
  }

  @Patch("schedules/:id")
  updateSchedule(
    @HospitalCtx() scope: HospitalScope,
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() dto: UpdateMaintenanceScheduleDto,
  ) {
    return this.schedules.update(scope, user, id, dto);
  }

  @Delete("schedules/:id")
  @UseGuards(EquipmentManageGuard)
  removeSchedule(
    @HospitalCtx() scope: HospitalScope,
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
  ) {
    return this.schedules.remove(scope, user, id);
  }

  @Get("templates")
  listTemplates(@HospitalCtx() scope: HospitalScope) {
    return this.templates.list(scope);
  }

  @Post("templates")
  @UseGuards(EquipmentManageGuard)
  createTemplate(
    @HospitalCtx() scope: HospitalScope,
    @Body() dto: CreateMaintenanceTemplateDto,
  ) {
    return this.templates.create(scope, dto);
  }

  @Patch("templates/:id")
  @UseGuards(EquipmentManageGuard)
  updateTemplate(
    @HospitalCtx() scope: HospitalScope,
    @Param("id") id: string,
    @Body() dto: UpdateMaintenanceTemplateDto,
  ) {
    return this.templates.update(scope, id, dto);
  }

  @Delete("templates/:id")
  @UseGuards(EquipmentManageGuard)
  removeTemplate(
    @HospitalCtx() scope: HospitalScope,
    @Param("id") id: string,
  ) {
    return this.templates.remove(scope, id);
  }
}
