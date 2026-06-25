import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { FaqAdminController } from "./faq-admin.controller";
import { FaqController } from "./faq.controller";
import { FaqService } from "./faq.service";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [FaqController, FaqAdminController],
  providers: [FaqService],
})
export class FaqModule {}
