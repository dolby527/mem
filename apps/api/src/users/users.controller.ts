import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { HospitalAdminGuard } from "../auth/hospital-admin.guard";
import { JwtCookieGuard } from "../auth/jwt-cookie.guard";
import { HospitalCtx } from "../common/decorators/hospital-scope.decorator";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import type { HospitalScope } from "../common/hospital-scope.types";
import { UpdateHospitalMemberRoleDto } from "./dto/update-hospital-member-role.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  @UseGuards(JwtCookieGuard)
  async getMe(@Req() req: Request) {
    const id = req.user?.id;
    if (!id) {
      throw new UnauthorizedException("사용자 정보를 찾을 수 없습니다.");
    }
    const user = await this.users.getMe(id);
    return { user };
  }

  @Patch("me/profile")
  @UseGuards(JwtCookieGuard)
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const id = req.user?.id;
    if (!id) {
      throw new UnauthorizedException("사용자 정보를 찾을 수 없습니다.");
    }
    const user = await this.users.updateOwnProfile(id, dto);
    return { user };
  }

  @Patch("me/password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtCookieGuard)
  async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    const id = req.user?.id;
    if (!id) {
      throw new UnauthorizedException("사용자 정보를 찾을 수 없습니다.");
    }
    await this.users.updateOwnPassword(id, dto);
  }

  @Get("members")
  @UseGuards(HospitalScopeGuard, HospitalAdminGuard)
  listMembers(@HospitalCtx() scope: HospitalScope) {
    return this.users.listHospitalMembers(scope.hospitalId);
  }

  @Delete("members/:userId")
  @UseGuards(HospitalScopeGuard, HospitalAdminGuard)
  deleteMember(
    @Req() req: Request,
    @HospitalCtx() scope: HospitalScope,
    @Param("userId") userId: string,
  ) {
    const actorId = req.user?.id;
    if (!actorId) {
      throw new UnauthorizedException("사용자 정보를 찾을 수 없습니다.");
    }
    return this.users.deleteHospitalMember(actorId, scope.hospitalId, userId);
  }

  @Patch("members/:userId/role")
  @UseGuards(HospitalScopeGuard, HospitalAdminGuard)
  updateMemberRole(
    @Req() req: Request,
    @HospitalCtx() scope: HospitalScope,
    @Param("userId") userId: string,
    @Body() dto: UpdateHospitalMemberRoleDto,
  ) {
    const actorId = req.user?.id;
    if (!actorId) {
      throw new UnauthorizedException("사용자 정보를 찾을 수 없습니다.");
    }
    return this.users.updateHospitalMemberRole(
      actorId,
      scope.hospitalId,
      userId,
      dto.role,
    );
  }
}
