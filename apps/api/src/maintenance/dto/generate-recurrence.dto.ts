import { OmitType } from "@nestjs/mapped-types";
import { RecurrenceInterval } from "@prisma/client";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { CreateMaintenanceScheduleDto } from "./create-schedule.dto";

export class GenerateRecurrenceDto extends OmitType(
  CreateMaintenanceScheduleDto,
  ["recurrenceInterval"] as const,
) {
  @IsEnum(RecurrenceInterval)
  recurrenceInterval!: RecurrenceInterval;

  @IsDateString()
  rangeEndDate!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentSlugs?: string[];
}
