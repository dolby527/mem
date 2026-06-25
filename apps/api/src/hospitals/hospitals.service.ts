import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HospitalsService {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string) {
    return this.prisma.hospital.findUnique({ where: { slug } });
  }

  findCurrent(scope: { hospitalId: string }) {
    return this.prisma.hospital.findUnique({
      where: { id: scope.hospitalId },
    });
  }
}
