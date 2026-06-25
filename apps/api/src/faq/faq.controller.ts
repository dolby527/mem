import { Controller, Get, UseGuards } from "@nestjs/common";
import { HospitalCtx } from "../common/decorators/hospital-scope.decorator";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import type { HospitalScope } from "../common/hospital-scope.types";
import { FaqService } from "./faq.service";

@Controller("faq")
@UseGuards(HospitalScopeGuard)
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  list(@HospitalCtx() scope: HospitalScope) {
    return this.faqService.listPublished(scope.hospitalId);
  }
}
