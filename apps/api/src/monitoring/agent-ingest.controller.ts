import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AgentIngestGuard } from "./agent-ingest.guard";
import { AgentIngestService } from "./agent-ingest.service";
import { AgentReportDto } from "./dto/agent-report.dto";

@Controller("monitoring/ingest/agent")
@UseGuards(AgentIngestGuard)
export class AgentIngestController {
  constructor(private readonly agentIngest: AgentIngestService) {}

  @Post("equipments/:equipmentSlug/report")
  report(
    @Req()
    req: {
      agentIngestEquipment: { id: string };
    },
    @Body() dto: AgentReportDto,
  ) {
    return this.agentIngest.report(req.agentIngestEquipment.id, dto);
  }
}
