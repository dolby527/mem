import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import type { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInviteDto } from "./dto/create-invite.dto";

function resolveFrontendBase(): string {
  const fromEnv = process.env.FRONTEND_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new InternalServerErrorException(
    "FRONTEND_URL must be set in production for invite links.",
  );
}

function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getHospitalAdminContext(req: Request) {
    const id = req.user?.id;
    if (!id || req.user?.role !== UserRole.HOSPITAL_ADMIN) {
      throw new ForbiddenException("병원 관리자만 초대할 수 있습니다.");
    }
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null, role: UserRole.HOSPITAL_ADMIN },
      select: { id: true, hospitalId: true },
    });
    if (!user) {
      throw new ForbiddenException("병원 관리자만 초대할 수 있습니다.");
    }
    return user;
  }

  async getInviteInfo(inviteId: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { id: inviteId },
    });
    if (!invite) {
      throw new NotFoundException("초대 링크가 존재하지 않습니다.");
    }
    if (
      invite.role !== UserRole.HOSPITAL_USER &&
      invite.role !== UserRole.HOSPITAL_ADMIN
    ) {
      throw new NotFoundException("유효하지 않은 초대 권한입니다.");
    }
    return {
      id: invite.id,
      name: invite.name,
      email: invite.email,
      expiresAt: invite.expiresAt.toISOString(),
      isUsed: invite.isUsed,
      role: invite.role,
    };
  }

  async createInvite(req: Request, dto: CreateInviteDto) {
    const ctx = await this.getHospitalAdminContext(req);
    const emailTrim = dto.email.trim();
    const nameTrim = dto.name.trim();
    const expiresInDays = dto.expiresInDays ?? 7;

    const existingUser = await this.prisma.user.findFirst({
      where: { email: emailTrim, deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictException("이미 등록된 이메일입니다.");
    }

    const hospital = await this.prisma.hospital.findUnique({
      where: { id: ctx.hospitalId },
    });
    if (!hospital) {
      throw new NotFoundException("병원 정보를 찾을 수 없습니다.");
    }

    const existingInvite = await this.prisma.invite.findFirst({
      where: {
        email: emailTrim,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });
    if (existingInvite) {
      await this.prisma.invite.delete({ where: { id: existingInvite.id } });
    }

    const prismaRole =
      dto.role === "HOSPITAL_ADMIN"
        ? UserRole.HOSPITAL_ADMIN
        : UserRole.HOSPITAL_USER;

    const invite = await this.prisma.invite.create({
      data: {
        email: emailTrim,
        name: nameTrim,
        role: prismaRole,
        hospitalId: ctx.hospitalId,
        invitedById: ctx.id,
        expiresAt: addDays(new Date(), expiresInDays),
        isUsed: false,
      },
    });

    const inviteLink = `${resolveFrontendBase()}/signup/${invite.id}`;
    this.logger.log(
      `Invite created id=${invite.id} hospital=${hospital.slug} to=${emailTrim} link=${inviteLink}`,
    );

    return {
      message: "초대 링크가 생성되었습니다.",
      inviteId: invite.id,
      inviteLink,
      expiresAt: invite.expiresAt.toISOString(),
    };
  }
}
