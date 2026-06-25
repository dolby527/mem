import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { CreateMaintenanceScheduleDto } from "./create-schedule.dto";

export class BulkMaintenanceSchedulesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaintenanceScheduleDto)
  schedules!: CreateMaintenanceScheduleDto[];
}
