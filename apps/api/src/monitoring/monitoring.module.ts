import { Module } from "@nestjs/common";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import { AuthModule } from "../auth/auth.module";
import { AgentIngestController } from "./agent-ingest.controller";
import { AgentIngestGuard } from "./agent-ingest.guard";
import { AgentIngestService } from "./agent-ingest.service";
import { HealthCheckService } from "./health-check.service";
import { InterfaceIngestController } from "./interface-ingest.controller";
import { InterfaceIngestGuard } from "./interface-ingest.guard";
import { InterfaceIngestService } from "./interface-ingest.service";
import { IotIngestController } from "./iot-ingest.controller";
import { IotIngestService } from "./iot-ingest.service";
import { MonitoringEventsService } from "./monitoring-events.service";
import { MonitoringController } from "./monitoring.controller";
import { MonitoringScheduler } from "./monitoring.scheduler";
import { PingService } from "./ping.service";
import { SseController } from "./sse.controller";
import { StatusEngineService } from "./status-engine.service";

@Module({
  imports: [AuthModule],
  controllers: [
    SseController,
    MonitoringController,
    InterfaceIngestController,
    AgentIngestController,
    IotIngestController,
  ],
  providers: [
    HospitalScopeGuard,
    PingService,
    MonitoringEventsService,
    StatusEngineService,
    InterfaceIngestService,
    AgentIngestService,
    IotIngestService,
    InterfaceIngestGuard,
    AgentIngestGuard,
    HealthCheckService,
    MonitoringScheduler,
  ],
  exports: [MonitoringEventsService, HealthCheckService, StatusEngineService],
})
export class MonitoringModule {}
