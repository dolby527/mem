import {
  EquipmentCategory,
  EquipmentStatus,
  MaintenanceStatus,
  StatusSourceType,
  VendorInterfaceType,
} from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateEquipmentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "equipmentSlug must be kebab-case (a-z, 0-9, hyphen)",
  })
  equipmentSlug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsEnum(EquipmentCategory)
  category!: EquipmentCategory;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  spatialBuilding?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  spatialFloor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  spatialRoom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  model?: string;

  @IsOptional()
  @IsDateString()
  manufacturedAt?: string;

  @IsEnum(StatusSourceType)
  statusSourceType!: StatusSourceType;

  @IsOptional()
  @IsEnum(StatusSourceType)
  fallbackSourceType?: StatusSourceType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  statusSourceTypeReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  vendorDeviceId?: string;

  @IsOptional()
  @IsEnum(VendorInterfaceType)
  vendorInterfaceType?: VendorInterfaceType;

  @IsOptional()
  @IsEnum(EquipmentStatus)
  currentStatus?: EquipmentStatus;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  maintenanceStatus?: MaintenanceStatus;

  @IsOptional()
  @IsDateString()
  pmScheduledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  devProbeHost?: string;

  @IsOptional()
  @IsNumber()
  iotIdleThresholdW?: number;

  @IsOptional()
  @IsNumber()
  iotRunningThresholdW?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  imageAlt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
