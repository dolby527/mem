import { IsEnum } from "class-validator";

export class UpdateHospitalMemberRoleDto {
  @IsEnum(["HOSPITAL_USER", "HOSPITAL_ADMIN"] as const)
  role!: "HOSPITAL_USER" | "HOSPITAL_ADMIN";
}
