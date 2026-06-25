import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateFaqDto } from "./dto/create-faq.dto";
import type { UpdateFaqDto } from "./dto/update-faq.dto";

export interface FaqItemJson {
  id: string;
  question: string;
  answer: string;
}

export type FaqAdminItemJson = FaqItemJson & {
  sortOrder: number;
  isPublished: boolean;
};

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished(hospitalId: string): Promise<FaqItemJson[]> {
    const rows = await this.prisma.faqItem.findMany({
      where: { hospitalId, isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
    }));
  }

  async listForAdmin(hospitalId: string): Promise<FaqAdminItemJson[]> {
    const rows = await this.prisma.faqItem.findMany({
      where: { hospitalId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      sortOrder: r.sortOrder,
      question: r.question,
      answer: r.answer,
      isPublished: r.isPublished,
    }));
  }

  async createForAdmin(
    hospitalId: string,
    dto: CreateFaqDto,
  ): Promise<FaqAdminItemJson> {
    const question = dto.question.trim();
    const answer = dto.answer.replaceAll("\r\n", "\n").trim();

    let sortOrder = dto.sortOrder;
    if (sortOrder == null) {
      const max = await this.prisma.faqItem.aggregate({
        where: { hospitalId },
        _max: { sortOrder: true },
      });
      sortOrder = (max._max.sortOrder ?? 0) + 1;
    }

    const created = await this.prisma.faqItem.create({
      data: {
        hospitalId,
        sortOrder,
        question,
        answer,
        isPublished: true,
      },
    });

    return {
      id: created.id,
      sortOrder: created.sortOrder,
      question: created.question,
      answer: created.answer,
      isPublished: created.isPublished,
    };
  }

  async updateForAdmin(
    hospitalId: string,
    id: string,
    dto: UpdateFaqDto,
  ): Promise<FaqAdminItemJson> {
    const existing = await this.prisma.faqItem.findFirst({
      where: { id, hospitalId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException("FAQ를 찾을 수 없습니다.");
    }

    const question = dto.question.trim();
    const answer = dto.answer.replaceAll("\r\n", "\n").trim();

    const updated = await this.prisma.faqItem.update({
      where: { id },
      data: { question, answer },
    });

    return {
      id: updated.id,
      sortOrder: updated.sortOrder,
      question: updated.question,
      answer: updated.answer,
      isPublished: updated.isPublished,
    };
  }

  async deleteForAdmin(hospitalId: string, id: string): Promise<void> {
    const row = await this.prisma.faqItem.findFirst({
      where: { id, hospitalId },
      select: { id: true },
    });
    if (!row) {
      throw new NotFoundException("FAQ를 찾을 수 없습니다.");
    }
    await this.prisma.faqItem.delete({ where: { id } });
  }
}
