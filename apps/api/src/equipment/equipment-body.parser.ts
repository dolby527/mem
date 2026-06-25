import { BadRequestException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateEquipmentDto } from "./dto/create-equipment.dto";
import { UpdateEquipmentDto } from "./dto/update-equipment.dto";

function formatValidationErrors(
  errors: Awaited<ReturnType<typeof validate>>,
): string {
  const messages: string[] = [];
  for (const err of errors) {
    if (err.constraints) {
      messages.push(...Object.values(err.constraints));
    }
  }
  return messages.join(" ") || "입력값이 올바르지 않습니다.";
}

function parseJsonBody(body: Record<string, unknown>): unknown {
  if (typeof body.data === "string") {
    try {
      return JSON.parse(body.data) as unknown;
    } catch {
      throw new BadRequestException("data 필드 JSON이 올바르지 않습니다.");
    }
  }
  const { data: _data, image: _image, ...rest } = body;
  void _data;
  void _image;
  return rest;
}

export async function parseCreateEquipmentDto(
  body: Record<string, unknown>,
): Promise<CreateEquipmentDto> {
  const dto = plainToInstance(CreateEquipmentDto, parseJsonBody(body));
  const errors = await validate(dto);
  if (errors.length) {
    throw new BadRequestException(formatValidationErrors(errors));
  }
  return dto;
}

export async function parseUpdateEquipmentDto(
  body: Record<string, unknown>,
): Promise<UpdateEquipmentDto> {
  const dto = plainToInstance(UpdateEquipmentDto, parseJsonBody(body));
  const errors = await validate(dto);
  if (errors.length) {
    throw new BadRequestException(formatValidationErrors(errors));
  }
  return dto;
}

export function assertCreateLocation(dto: CreateEquipmentDto) {
  const hasLocation =
    dto.location?.trim() ||
    dto.spatialBuilding?.trim() ||
    dto.spatialFloor?.trim() ||
    dto.spatialRoom?.trim();
  if (!hasLocation) {
    throw new BadRequestException(
      "위치 정보(원문·건물·층·부서 중 하나 이상)가 필요합니다.",
    );
  }
}
