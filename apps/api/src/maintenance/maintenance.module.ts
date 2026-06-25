import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { EquipmentManageGuard } from "../auth/equipment-manage.guard";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import { MaintenanceController } from "./maintenance.controller";
import { MaintenanceSchedulesService } from "./maintenance-schedules.service";
import { MaintenanceSyncService } from "./maintenance-sync.service";
import { MaintenanceTemplatesService } from "./maintenance-templates.service";

@Module({
  imports: [AuthModule],
  controllers: [MaintenanceController],
  providers: [
    MaintenanceSchedulesService,
    MaintenanceTemplatesService,
    MaintenanceSyncService,
    HospitalScopeGuard,
    EquipmentManageGuard,
  ],
  exports: [MaintenanceSyncService],
})
export class MaintenanceModule {}
