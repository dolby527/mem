import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { HospitalAdminGuard } from "../auth/hospital-admin.guard";
import { JwtCookieGuard } from "../auth/jwt-cookie.guard";
import { CreateInviteDto } from "./dto/create-invite.dto";
import { InviteService } from "./invite.service";

@Controller("invite")
export class InviteController {
  constructor(private readonly invite: InviteService) {}

  @Get(":inviteId")
  getInvite(@Param("inviteId") inviteId: string) {
    return this.invite.getInviteInfo(inviteId);
  }

  @Post()
  @UseGuards(JwtCookieGuard, HospitalAdminGuard)
  createInvite(@Req() req: Request, @Body() dto: CreateInviteDto) {
    return this.invite.createInvite(req, dto);
  }
}
