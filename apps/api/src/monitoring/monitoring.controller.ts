import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { HospitalCtx } from "../common/decorators/hospital-scope.decorator";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import type { HospitalScope } from "../common/hospital-scope.types";
import { HealthCheckService } from "./health-check.service";

@Controller("monitoring")
@UseGuards(HospitalScopeGuard)
export class MonitoringController {
  constructor(private readonly healthCheck: HealthCheckService) {}

  @Post("equipments/:equipmentSlug/recheck")
  recheckEquipment(
    @HospitalCtx() scope: HospitalScope,
    @Param("equipmentSlug") equipmentSlug: string,
  ) {
    return this.healthCheck.recheckBySlug(scope, equipmentSlug);
  }
}
