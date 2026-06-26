import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { JsonWebTokenError, TokenExpiredError, sign, verify } from "jsonwebtoken";
import { PrismaService } from "../prisma/prisma.service";
import { PLATFORM_HOSPITAL_SLUG, getJwtSecret } from "./auth.constants";
import { SignUpHospitalDto } from "./dto/sign-up-hospital.dto";
import { SignUpInviteDto } from "./dto/sign-up-invite.dto";
import { SignUpPlatformDto } from "./dto/sign-up-platform.dto";

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  hospital: { id: string; slug: string; name: string };
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private async issueTokens(user: {
    id: string;
    email: string;
    role: UserRole;
    hospitalId: string;
  }) {
    const secret = getJwtSecret();
    const accessToken = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
      },
      secret,
      { expiresIn: "15m" },
    );
    const refreshToken = sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: "7d" },
    );
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });
    return { accessToken, refreshToken };
  }

  private toUserPayload(user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl: string | null;
    hospital: { id: string; slug: string; name: string };
  }): AuthUserPayload {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      hospital: {
        id: user.hospital.id,
        slug: user.hospital.slug,
        name: user.hospital.name,
      },
    };
  }

  private readonly authUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    avatarUrl: true,
    hospitalId: true,
    hospital: { select: { id: true, slug: true, name: true } },
  } as const;

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim() },
      select: {
        ...this.authUserSelect,
        password: true,
        deletedAt: true,
      },
    });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException("이메일 또는 비밀번호가 일치하지 않습니다.");
    }
    const ok = await compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException("이메일 또는 비밀번호가 일치하지 않습니다.");
    }
    const tokens = await this.issueTokens(user);
    return {
      user: this.toUserPayload(user),
      ...tokens,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const secret = getJwtSecret();
    try {
      const decoded = verify(refreshToken, secret) as {
        userId: string;
        email: string;
      };
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!user?.hashedRefreshToken || user.deletedAt) {
        throw new UnauthorizedException("유효하지 않은 리프레시 토큰입니다.");
      }
      const valid = await compare(refreshToken, user.hashedRefreshToken);
      if (!valid) {
        throw new UnauthorizedException("유효하지 않은 리프레시 토큰입니다.");
      }
      const newAccessToken = sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          hospitalId: user.hospitalId,
        },
        secret,
        { expiresIn: "15m" },
      );
      const newRefreshToken = sign(
        { userId: user.id, email: user.email },
        secret,
        { expiresIn: "7d" },
      );
      await this.prisma.user.update({
        where: { id: user.id },
        data: { hashedRefreshToken: await hash(newRefreshToken, 10) },
      });
      return { newAccessToken, newRefreshToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("리프레시 토큰이 만료되었습니다.");
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException("유효하지 않은 리프레시 토큰입니다.");
      }
      throw new UnauthorizedException("유효하지 않은 리프레시 토큰입니다.");
    }
  }

  async logout(userId: string | undefined): Promise<void> {
    if (!userId) return;
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });
  }

  async signUpFromInvite(dto: SignUpInviteDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    }
    const invite = await this.prisma.invite.findUnique({
      where: { id: dto.inviteId.trim() },
      include: { hospital: true },
    });
    if (!invite) {
      throw new BadRequestException("유효하지 않은 초대 링크입니다.");
    }
    if (
      invite.role !== UserRole.HOSPITAL_USER &&
      invite.role !== UserRole.HOSPITAL_ADMIN
    ) {
      throw new BadRequestException("유효하지 않은 초대입니다.");
    }
    if (invite.isUsed) {
      throw new ConflictException("이미 사용된 초대 링크입니다.");
    }
    if (invite.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException("만료된 초대 링크입니다.");
    }
    const existing = await this.prisma.user.findUnique({
      where: { email: invite.email },
    });
    if (existing) {
      throw new ConflictException("이미 가입된 이메일입니다.");
    }
    const hashedPassword = await hash(dto.password, 10);
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: invite.email,
          name: invite.name,
          password: hashedPassword,
          role: invite.role,
          hospitalId: invite.hospitalId,
        },
        select: this.authUserSelect,
      });
      await tx.invite.update({
        where: { id: invite.id },
        data: { isUsed: true },
      });
      return created;
    });
    const tokens = await this.issueTokens(user);
    return { user: this.toUserPayload(user), ...tokens };
  }

  async signUpHospital(dto: SignUpHospitalDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    }
    const email = dto.email.trim();
    const slug = dto.hospitalSlug.trim();
    if (slug === PLATFORM_HOSPITAL_SLUG) {
      throw new BadRequestException("사용할 수 없는 병원 식별자입니다.");
    }
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException("이미 등록된 이메일입니다.");
    }
    const existingHospital = await this.prisma.hospital.findUnique({
      where: { slug },
    });
    if (existingHospital) {
      throw new ConflictException("이미 등록된 병원 식별자입니다.");
    }
    const hashedPassword = await hash(dto.password, 10);
    const { hospital, user } = await this.prisma.$transaction(async (tx) => {
      const h = await tx.hospital.create({
        data: {
          slug,
          name: dto.hospitalName.trim(),
        },
      });
      const u = await tx.user.create({
        data: {
          email,
          name: dto.name.trim(),
          password: hashedPassword,
          role: UserRole.HOSPITAL_ADMIN,
          hospitalId: h.id,
        },
        select: this.authUserSelect,
      });
      return { hospital: h, user: u };
    });
    return {
      message: "병원 관리자 회원가입이 완료되었습니다.",
      user: this.toUserPayload(user),
      hospital: { id: hospital.id, slug: hospital.slug, name: hospital.name },
    };
  }

  async signUpPlatform(dto: SignUpPlatformDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    }
    const existingPlatform = await this.prisma.user.findFirst({
      where: { role: UserRole.PLATFORM_ADMIN, deletedAt: null },
    });
    if (existingPlatform) {
      throw new ConflictException("플랫폼 관리자가 이미 등록되어 있습니다.");
    }
    const email = dto.email.trim();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException("이미 등록된 이메일입니다.");
    }
    const hashedPassword = await hash(dto.password, 10);
    const user = await this.prisma.$transaction(async (tx) => {
      const hospital = await tx.hospital.upsert({
        where: { slug: PLATFORM_HOSPITAL_SLUG },
        create: {
          slug: PLATFORM_HOSPITAL_SLUG,
          name: "MEM 플랫폼",
          notes: "시스템 운영자 전용 (병원 테넌트 아님)",
        },
        update: {},
      });
      return tx.user.create({
        data: {
          email,
          name: dto.name.trim(),
          password: hashedPassword,
          role: UserRole.PLATFORM_ADMIN,
          hospitalId: hospital.id,
        },
        select: this.authUserSelect,
      });
    });
    return {
      message: "플랫폼 관리자 회원가입이 완료되었습니다.",
      user: this.toUserPayload(user),
    };
  }
}
