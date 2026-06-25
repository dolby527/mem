import { IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateFaqDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  question!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  answer!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
