import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AgentIngestGuard } from "./agent-ingest.guard";
import { IotReadingDto } from "./dto/iot-reading.dto";
import { IotIngestService } from "./iot-ingest.service";

@Controller("monitoring/ingest/iot")
@UseGuards(AgentIngestGuard)
export class IotIngestController {
  constructor(private readonly iotIngest: IotIngestService) {}

  @Post("equipments/:equipmentSlug/reading")
  reading(
    @Param("equipmentSlug") _equipmentSlug: string,
    @Req()
    req: {
      agentIngestEquipment: { id: string };
    },
    @Body() dto: IotReadingDto,
  ) {
    void _equipmentSlug;
    return this.iotIngest.reading(req.agentIngestEquipment.id, dto);
  }
}
