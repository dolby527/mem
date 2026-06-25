import { IsString, MinLength } from "class-validator";

export class SignUpInviteDto {
  @IsString()
  @MinLength(1)
  inviteId!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}
