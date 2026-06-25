import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  MaintenanceScheduleStatus,
  MaintenanceStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { startOfUtcDay } from "./maintenance.util";

@Injectable()
export class MaintenanceSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async syncEquipmentPmFields(equipmentId: string): Promise<void> {
    const today = startOfUtcDay();
    const next = await this.prisma.maintenanceSchedule.findFirst({
      where: {
        equipmentId,
        status: {
          in: [
            MaintenanceScheduleStatus.SCHEDULED,
            MaintenanceScheduleStatus.IN_PROGRESS,
            MaintenanceScheduleStatus.OVERDUE,
          ],
        },
        scheduledDate: { gte: today },
      },
      orderBy: { scheduledDate: "asc" },
    });

    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        maintenanceStatus: next
          ? MaintenanceStatus.PM_SCHEDULED
          : MaintenanceStatus.NONE,
        pmScheduledAt: next?.scheduledDate ?? null,
      },
    });
  }

  async syncHospitalEquipment(hospitalId: string): Promise<void> {
    const equipment = await this.prisma.equipment.findMany({
      where: { hospitalId },
      select: { id: true },
    });
    for (const eq of equipment) {
      await this.syncEquipmentPmFields(eq.id);
    }
  }

  async markOverdueSchedules(hospitalId?: string): Promise<number> {
    const today = startOfUtcDay();
    const result = await this.prisma.maintenanceSchedule.updateMany({
      where: {
        ...(hospitalId ? { hospitalId } : {}),
        status: MaintenanceScheduleStatus.SCHEDULED,
        scheduledDate: { lt: today },
      },
      data: { status: MaintenanceScheduleStatus.OVERDUE },
    });
    return result.count;
  }

  async resolveEquipmentId(
    hospitalId: string,
    equipmentSlug: string,
  ): Promise<string> {
    const row = await this.prisma.equipment.findFirst({
      where: { hospitalId, equipmentSlug },
      select: { id: true },
    });
    if (!row) {
      throw new NotFoundException(`Equipment not found: ${equipmentSlug}`);
    }
    return row.id;
  }
}
