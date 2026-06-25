import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { HospitalAdminGuard } from "../auth/hospital-admin.guard";
import { HospitalCtx } from "../common/decorators/hospital-scope.decorator";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import type { HospitalScope } from "../common/hospital-scope.types";
import { CreateFaqDto } from "./dto/create-faq.dto";
import { UpdateFaqDto } from "./dto/update-faq.dto";
import { FaqService } from "./faq.service";

@Controller("admin/faq")
@UseGuards(HospitalScopeGuard, HospitalAdminGuard)
export class FaqAdminController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  list(@HospitalCtx() scope: HospitalScope) {
    return this.faqService.listForAdmin(scope.hospitalId);
  }

  @Post()
  create(@HospitalCtx() scope: HospitalScope, @Body() dto: CreateFaqDto) {
    return this.faqService.createForAdmin(scope.hospitalId, dto);
  }

  @Patch(":id")
  update(
    @HospitalCtx() scope: HospitalScope,
    @Param("id") id: string,
    @Body() dto: UpdateFaqDto,
  ) {
    return this.faqService.updateForAdmin(scope.hospitalId, id, dto);
  }

  @Delete(":id")
  async remove(@HospitalCtx() scope: HospitalScope, @Param("id") id: string) {
    await this.faqService.deleteForAdmin(scope.hospitalId, id);
  }
}
