import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import type { Request } from "express";

/** 병원 관리자만 — 초대 발급 등 */
@Injectable()
export class HospitalAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const role = req.user?.role;
    if (role !== UserRole.HOSPITAL_ADMIN) {
      throw new ForbiddenException("병원 관리자만 접근할 수 있습니다.");
    }
    return true;
  }
}
