import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { HospitalScope } from "../common/hospital-scope.types";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateMaintenanceTemplateDto,
  UpdateMaintenanceTemplateDto,
} from "./dto/create-template.dto";

@Injectable()
export class MaintenanceTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  list(scope: HospitalScope) {
    return this.prisma.maintenanceChecklistTemplate.findMany({
      where: { hospitalId: scope.hospitalId },
      orderBy: { name: "asc" },
    });
  }

  create(scope: HospitalScope, dto: CreateMaintenanceTemplateDto) {
    return this.prisma.maintenanceChecklistTemplate.create({
      data: {
        hospitalId: scope.hospitalId,
        name: dto.name,
        manufacturer: dto.manufacturer,
        model: dto.model,
        category: dto.category,
        maintenanceType: dto.maintenanceType,
        items: dto.items as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async update(
    scope: HospitalScope,
    id: string,
    dto: UpdateMaintenanceTemplateDto,
  ) {
    await this.findScoped(scope, id);
    const data: Prisma.MaintenanceChecklistTemplateUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.items !== undefined) {
      data.items = dto.items as unknown as Prisma.InputJsonValue;
    }
    return this.prisma.maintenanceChecklistTemplate.update({
      where: { id },
      data,
    });
  }

  async remove(scope: HospitalScope, id: string) {
    await this.findScoped(scope, id);
    await this.prisma.maintenanceChecklistTemplate.delete({ where: { id } });
    return { ok: true };
  }

  private async findScoped(scope: HospitalScope, id: string) {
    const row = await this.prisma.maintenanceChecklistTemplate.findFirst({
      where: { id, hospitalId: scope.hospitalId },
    });
    if (!row) {
      throw new NotFoundException(`Template not found: ${id}`);
    }
    return row;
  }
}
