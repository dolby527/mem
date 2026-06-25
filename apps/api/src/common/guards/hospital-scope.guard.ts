import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import { getJwtSecret } from "../../auth/auth.constants";
import { PrismaService } from "../../prisma/prisma.service";
import type { HospitalScope } from "../hospital-scope.types";

function getCookie(
  cookies: Record<string, unknown> | undefined,
  name: string,
): string | undefined {
  const value = cookies?.[name];
  return typeof value === "string" ? value : undefined;
}

/**
 * JWT 쿠키 인증 + 병원 스코프.
 * - HOSPITAL_USER / HOSPITAL_ADMIN: JWT hospitalId 고정
 * - PLATFORM_ADMIN: `x-hospital-slug` 로 조회 병원 선택 (시스템 운영)
 */
@Injectable()
export class HospitalScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      cookies?: Record<string, unknown>;
      headers: Record<string, string | undefined>;
      query?: Record<string, string | string[] | undefined>;
      hospitalScope?: HospitalScope;
      user?: {
        id: string;
        email: string;
        role: UserRole;
        hospitalId: string;
      };
    }>();

    const token = getCookie(request.cookies, "accessToken");
    if (!token) {
      throw new UnauthorizedException("인증이 필요합니다.");
    }

    let decoded: {
      userId: string;
      email: string;
      role: UserRole;
      hospitalId: string;
    };
    try {
      decoded = verify(token, getJwtSecret()) as typeof decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("인증 토큰이 만료되었습니다.");
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException("유효하지 않은 인증 토큰입니다.");
      }
      throw new UnauthorizedException("유효하지 않은 인증 토큰입니다.");
    }

    request.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      hospitalId: decoded.hospitalId,
    };

    let hospitalSlug: string | undefined;

    if (decoded.role === UserRole.PLATFORM_ADMIN) {
      hospitalSlug = request.headers["x-hospital-slug"]?.trim();
      if (!hospitalSlug) {
        const raw = request.query?.hospitalSlug;
        hospitalSlug = (Array.isArray(raw) ? raw[0] : raw)?.trim();
      }
      if (!hospitalSlug) {
        throw new ForbiddenException(
          "플랫폼 관리자는 x-hospital-slug 헤더 또는 hospitalSlug 쿼리로 병원을 지정해야 합니다.",
        );
      }
    } else {
      const home = await this.prisma.hospital.findUnique({
        where: { id: decoded.hospitalId },
        select: { slug: true },
      });
      if (!home) {
        throw new ForbiddenException("소속 병원을 찾을 수 없습니다.");
      }
      hospitalSlug = home.slug;
    }

    const hospital = await this.prisma.hospital.findUnique({
      where: { slug: hospitalSlug },
      select: { id: true, slug: true },
    });
    if (!hospital) {
      throw new ForbiddenException(`Unknown hospital slug: ${hospitalSlug}`);
    }

    if (
      decoded.role !== UserRole.PLATFORM_ADMIN &&
      hospital.id !== decoded.hospitalId
    ) {
      throw new ForbiddenException("다른 병원 데이터에 접근할 수 없습니다.");
    }

    request.hospitalScope = {
      hospitalId: hospital.id,
      hospitalSlug: hospital.slug,
    };

    return true;
  }
}
