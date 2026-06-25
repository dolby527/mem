import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { AuthService } from "./auth.service";
import {
  clearAuthCookies,
  setAuthCookies,
  setRefreshedAuthCookies,
} from "./auth-cookies.util";
import { getJwtSecret } from "./auth.constants";
import { LoginDto } from "./dto/login.dto";
import { SignUpHospitalDto } from "./dto/sign-up-hospital.dto";
import { SignUpInviteDto } from "./dto/sign-up-invite.dto";
import { SignUpPlatformDto } from "./dto/sign-up-platform.dto";

function getCookie(req: Request, name: string): string | undefined {
  const value = (req.cookies as Record<string, unknown> | undefined)?.[name];
  return typeof value === "string" ? value : undefined;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } = await this.auth.login(
      body.email,
      body.password,
    );
    setAuthCookies(res, accessToken, refreshToken);
    return {
      message: "로그인이 성공적으로 처리되었습니다.",
      user,
    };
  }

  @Post("signup-invite")
  @HttpCode(HttpStatus.CREATED)
  async signUpInvite(
    @Body() body: SignUpInviteDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.auth.signUpFromInvite(body);
    setAuthCookies(res, accessToken, refreshToken);
    return { message: "회원가입이 완료되었습니다.", user };
  }

  @Post("signup-hospital")
  @HttpCode(HttpStatus.CREATED)
  signUpHospital(@Body() body: SignUpHospitalDto) {
    return this.auth.signUpHospital(body);
  }

  @Post("signup-platform")
  @HttpCode(HttpStatus.CREATED)
  signUpPlatform(@Body() body: SignUpPlatformDto) {
    return this.auth.signUpPlatform(body);
  }

  @Post("refresh-token")
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = getCookie(req, "refreshToken");
    if (!refreshToken) {
      throw new BadRequestException(
        "리프레시 토큰이 제공되지 않았습니다. 다시 로그인해주세요.",
      );
    }
    const { newAccessToken, newRefreshToken } =
      await this.auth.refreshAccessToken(refreshToken);
    setRefreshedAuthCookies(res, newAccessToken, newRefreshToken);
    return { message: "새로운 Access Token이 발급되었습니다." };
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    let userId: string | undefined;
    const accessToken = getCookie(req, "accessToken");
    if (accessToken) {
      try {
        const decoded = verify(accessToken, getJwtSecret()) as {
          userId: string;
        };
        userId = decoded.userId;
      } catch {
        /* still clear cookies */
      }
    }
    await this.auth.logout(userId);
    clearAuthCookies(res);
    return { message: "성공적으로 로그아웃되었습니다." };
  }
}
