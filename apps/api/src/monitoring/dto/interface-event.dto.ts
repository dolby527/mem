import { VendorInterfaceType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";

export class InterfaceEventDto {
  @IsString()
  @MaxLength(120)
  vendorDeviceId!: string;

  @IsString()
  @MaxLength(80)
  eventType!: string;

  @IsOptional()
  @IsEnum(VendorInterfaceType)
  vendorInterfaceType?: VendorInterfaceType;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  vendorStatusCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class InterfaceEventBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterfaceEventDto)
  events!: InterfaceEventDto[];
}
