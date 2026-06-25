import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { EquipmentManageGuard } from "../auth/equipment-manage.guard";
import { HospitalCtx } from "../common/decorators/hospital-scope.decorator";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import type { HospitalScope } from "../common/hospital-scope.types";
import {
  parseCreateEquipmentDto,
  parseUpdateEquipmentDto,
} from "./equipment-body.parser";
import { EquipmentService } from "./equipment.service";

const imageUpload = FileInterceptor("image", {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

@Controller("equipment")
@UseGuards(HospitalScopeGuard)
export class EquipmentController {
  constructor(private readonly equipment: EquipmentService) {}

  @Get()
  list(@HospitalCtx() scope: HospitalScope) {
    return this.equipment.findAll(scope);
  }

  @Get(":equipmentSlug/health-checks")
  listHealthChecks(
    @HospitalCtx() scope: HospitalScope,
    @Param("equipmentSlug") equipmentSlug: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return this.equipment.listHealthCheckLogs(scope, equipmentSlug, {
      cursor: cursor || undefined,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
    });
  }

  @Get(":equipmentSlug")
  getOne(
    @HospitalCtx() scope: HospitalScope,
    @Param("equipmentSlug") equipmentSlug: string,
  ) {
    return this.equipment.findOneBySlug(scope, equipmentSlug);
  }

  @Post()
  @UseGuards(EquipmentManageGuard)
  @UseInterceptors(imageUpload)
  async create(
    @HospitalCtx() scope: HospitalScope,
    @Body() body: Record<string, unknown>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const dto = await parseCreateEquipmentDto(body);
    return this.equipment.create(scope, dto, file);
  }

  @Patch(":equipmentSlug")
  @UseGuards(EquipmentManageGuard)
  @UseInterceptors(imageUpload)
  async update(
    @HospitalCtx() scope: HospitalScope,
    @Param("equipmentSlug") equipmentSlug: string,
    @Body() body: Record<string, unknown>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const dto = await parseUpdateEquipmentDto(body);
    return this.equipment.update(scope, equipmentSlug, dto, file);
  }

  @Delete(":equipmentSlug")
  @UseGuards(EquipmentManageGuard)
  remove(
    @HospitalCtx() scope: HospitalScope,
    @Param("equipmentSlug") equipmentSlug: string,
  ) {
    return this.equipment.remove(scope, equipmentSlug);
  }

  @Post(":equipmentSlug/agent-token")
  @UseGuards(EquipmentManageGuard)
  regenerateAgentToken(
    @HospitalCtx() scope: HospitalScope,
    @Param("equipmentSlug") equipmentSlug: string,
  ) {
    return this.equipment.regenerateAgentToken(scope, equipmentSlug);
  }
}
