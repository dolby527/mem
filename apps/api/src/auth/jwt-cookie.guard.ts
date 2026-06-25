import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { UserRole } from "@prisma/client";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import { getJwtSecret } from "./auth.constants";

function getCookie(req: Request, name: string): string | undefined {
  const value = (req.cookies as Record<string, unknown> | undefined)?.[name];
  return typeof value === "string" ? value : undefined;
}

@Injectable()
export class JwtCookieGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = getCookie(req, "accessToken");
    if (!token) {
      throw new UnauthorizedException("인증 토큰이 제공되지 않았습니다.");
    }
    try {
      const decoded = verify(token, getJwtSecret()) as {
        userId: string;
        email: string;
        role: UserRole;
        hospitalId: string;
      };
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        hospitalId: decoded.hospitalId,
      };
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("인증 토큰이 만료되었습니다.");
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException("유효하지 않은 인증 토큰입니다.");
      }
      throw new UnauthorizedException("유효하지 않은 인증 토큰입니다.");
    }
  }
}
