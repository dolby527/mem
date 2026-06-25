import { Controller, Get, UseGuards } from "@nestjs/common";
import { HospitalCtx } from "../common/decorators/hospital-scope.decorator";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import type { HospitalScope } from "../common/hospital-scope.types";
import { HospitalsService } from "./hospitals.service";

@Controller("hospitals")
@UseGuards(HospitalScopeGuard)
export class HospitalsController {
  constructor(private readonly hospitals: HospitalsService) {}

  @Get("current")
  getCurrent(@HospitalCtx() scope: HospitalScope) {
    return this.hospitals.findCurrent(scope);
  }
}
