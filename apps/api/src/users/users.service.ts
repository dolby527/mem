import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { hash } from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  listHospitalMembers(hospitalId: string) {
    return this.prisma.user.findMany({
      where: {
        hospitalId,
        deletedAt: null,
        role: { not: UserRole.PLATFORM_ADMIN },
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
  }

  async deleteHospitalMember(
    actorId: string,
    hospitalId: string,
    targetUserId: string,
  ) {
    if (actorId === targetUserId) {
      throw new BadRequestException("자기 자신은 탈퇴시킬 수 없습니다.");
    }
    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, hospitalId, deletedAt: null },
    });
    if (!target) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }
    if (target.role === UserRole.PLATFORM_ADMIN) {
      throw new BadRequestException("플랫폼 운영자는 탈퇴시킬 수 없습니다.");
    }
    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { deletedAt: new Date() },
    });
    return { message: "사용자가 성공적으로 탈퇴 처리되었습니다." };
  }

  async updateHospitalMemberRole(
    actorId: string,
    hospitalId: string,
    targetUserId: string,
    role: "HOSPITAL_USER" | "HOSPITAL_ADMIN",
  ) {
    if (actorId === targetUserId) {
      throw new BadRequestException("자기 자신의 권한은 변경할 수 없습니다.");
    }
    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, hospitalId, deletedAt: null },
    });
    if (!target) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }
    if (target.role === UserRole.PLATFORM_ADMIN) {
      throw new BadRequestException("플랫폼 운영자 권한은 변경할 수 없습니다.");
    }
    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { role: true },
    });
    return {
      message: "사용자 권한이 성공적으로 변경되었습니다.",
      role: updated.role,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        hospital: { select: { id: true, slug: true, name: true } },
      },
    });
    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }
    return user;
  }

  async updateOwnProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }

    const avatarUrl =
      dto.avatarUrl === undefined
        ? undefined
        : dto.avatarUrl === null || dto.avatarUrl === ""
          ? null
          : dto.avatarUrl.trim();

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        hospital: { select: { id: true, slug: true, name: true } },
      },
    });
    return updated;
  }

  async updateOwnPassword(
    userId: string,
    body: { newPassword: string; newPasswordConfirm: string },
  ): Promise<void> {
    const { newPassword, newPasswordConfirm } = body;
    if (newPassword !== newPasswordConfirm) {
      throw new BadRequestException("비밀번호가 일치하지 않습니다.");
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }

    const hashed = await hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  }
}
