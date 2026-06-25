import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { verifyIngestToken } from "./ingest-token.util";

@Injectable()
export class InterfaceIngestGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      interfaceIngestHospitalId?: string;
      interfaceIngestHospitalSlug?: string;
    }>();

    const token = request.headers["x-interface-token"]?.trim();
    const hospitalSlug = request.headers["x-hospital-slug"]?.trim();
    if (!token || !hospitalSlug) {
      throw new UnauthorizedException(
        "x-interface-token 및 x-hospital-slug 헤더가 필요합니다.",
      );
    }

    const hospital = await this.prisma.hospital.findUnique({
      where: { slug: hospitalSlug },
      select: { id: true, slug: true, interfaceIngestTokenHash: true },
    });
    if (!hospital?.interfaceIngestTokenHash) {
      throw new UnauthorizedException("인터페이스 토큰이 설정되지 않았습니다.");
    }

    const ok = await verifyIngestToken(
      token,
      hospital.interfaceIngestTokenHash,
    );
    if (!ok) {
      throw new UnauthorizedException("유효하지 않은 인터페이스 토큰입니다.");
    }

    request.interfaceIngestHospitalId = hospital.id;
    request.interfaceIngestHospitalSlug = hospital.slug;
    return true;
  }
}
