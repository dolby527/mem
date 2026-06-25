import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { EquipmentManageGuard } from "./equipment-manage.guard";
import { HospitalAdminGuard } from "./hospital-admin.guard";
import { JwtCookieGuard } from "./jwt-cookie.guard";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtCookieGuard,
    HospitalAdminGuard,
    EquipmentManageGuard,
  ],
  exports: [
    AuthService,
    JwtCookieGuard,
    HospitalAdminGuard,
    EquipmentManageGuard,
  ],
})
export class AuthModule {}
