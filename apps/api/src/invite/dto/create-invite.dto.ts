import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export enum InviteRoleDto {
  HOSPITAL_USER = "HOSPITAL_USER",
  HOSPITAL_ADMIN = "HOSPITAL_ADMIN",
}

export class CreateInviteDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(InviteRoleDto)
  role!: InviteRoleDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  expiresInDays?: number;
}
