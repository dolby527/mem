import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import { EquipmentController } from "./equipment.controller";
import { EquipmentImageStorage } from "./equipment-image.storage";
import { EquipmentService } from "./equipment.service";

@Module({
  imports: [AuthModule],
  controllers: [EquipmentController],
  providers: [EquipmentService, EquipmentImageStorage, HospitalScopeGuard],
  exports: [EquipmentService],
})
export class EquipmentModule {}
