import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { compare } from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AgentIngestGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      params: { equipmentSlug?: string };
      agentIngestEquipment?: {
        id: string;
        hospitalId: string;
        equipmentSlug: string;
      };
    }>();

    const token = request.headers["x-agent-token"]?.trim();
    const equipmentSlug = request.params.equipmentSlug?.trim();
    if (!token || !equipmentSlug) {
      throw new UnauthorizedException(
        "x-agent-token 및 equipmentSlug가 필요합니다.",
      );
    }

    const equipment = await this.prisma.equipment.findUnique({
      where: { equipmentSlug },
      select: {
        id: true,
        hospitalId: true,
        equipmentSlug: true,
        agentTokenHash: true,
      },
    });
    if (!equipment?.agentTokenHash) {
      throw new UnauthorizedException("에이전트 토큰이 설정되지 않았습니다.");
    }

    const ok = await compare(token, equipment.agentTokenHash);
    if (!ok) {
      throw new UnauthorizedException("유효하지 않은 에이전트 토큰입니다.");
    }

    request.agentIngestEquipment = equipment;
    return true;
  }
}
