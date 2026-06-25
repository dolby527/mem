import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import {
  InterfaceEventBatchDto,
  InterfaceEventDto,
} from "./dto/interface-event.dto";
import { InterfaceIngestGuard } from "./interface-ingest.guard";
import { InterfaceIngestService } from "./interface-ingest.service";

@Controller("monitoring/ingest/interface")
@UseGuards(InterfaceIngestGuard)
export class InterfaceIngestController {
  constructor(private readonly interfaceIngest: InterfaceIngestService) {}

  @Post("events")
  ingestEvent(
    @Req()
    req: {
      interfaceIngestHospitalId: string;
    },
    @Body() dto: InterfaceEventDto,
  ) {
    return this.interfaceIngest.ingestEvents(
      req.interfaceIngestHospitalId,
      [dto],
    );
  }

  @Post("events/batch")
  ingestBatch(
    @Req()
    req: {
      interfaceIngestHospitalId: string;
    },
    @Body() dto: InterfaceEventBatchDto,
  ) {
    return this.interfaceIngest.ingestEvents(
      req.interfaceIngestHospitalId,
      dto.events,
    );
  }
}
