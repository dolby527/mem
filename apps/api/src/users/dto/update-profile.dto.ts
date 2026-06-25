import { IsOptional, IsUrl, MaxLength, ValidateIf } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsUrl({ require_protocol: true }, { message: "올바른 이미지 URL을 입력해 주세요." })
  @MaxLength(2048)
  avatarUrl?: string | null;
}
