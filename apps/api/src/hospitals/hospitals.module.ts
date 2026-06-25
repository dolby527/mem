import { Module } from "@nestjs/common";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import { HospitalsController } from "./hospitals.controller";
import { HospitalsService } from "./hospitals.service";

@Module({
  controllers: [HospitalsController],
  providers: [HospitalsService, HospitalScopeGuard],
  exports: [HospitalsService],
})
export class HospitalsModule {}
