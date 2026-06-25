import { MaintenanceScheduleType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class BulkImportRowDto {
  @IsString()
  equipmentSlug!: string;

  @IsEnum(MaintenanceScheduleType)
  maintenanceType!: MaintenanceScheduleType;

  @IsDateString()
  scheduledDate!: string;

  @IsOptional()
  @IsString()
  assignedEmail?: string;

  @IsOptional()
  @IsString()
  templateCode?: string;

  @IsOptional()
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  vendorEngineer?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkImportMaintenanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkImportRowDto)
  rows!: BulkImportRowDto[];
}
