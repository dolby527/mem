import {
  MaintenanceScheduleType,
  RecurrenceInterval,
} from "@prisma/client";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class ChecklistItemDto {
  @IsString()
  id!: string;

  @IsString()
  @MaxLength(500)
  label!: string;

  @IsOptional()
  required?: boolean;
}

export class CreateMaintenanceScheduleDto {
  @IsString()
  equipmentSlug!: string;

  @IsEnum(MaintenanceScheduleType)
  maintenanceType!: MaintenanceScheduleType;

  @IsDateString()
  scheduledDate!: string;

  @IsOptional()
  @IsString()
  assignedToUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  vendorEngineer?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklistItems?: ChecklistItemDto[];

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  recurrenceGroupId?: string;

  @IsOptional()
  @IsEnum(RecurrenceInterval)
  recurrenceInterval?: RecurrenceInterval;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
