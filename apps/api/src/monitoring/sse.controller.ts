import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { HospitalCtx } from "../common/decorators/hospital-scope.decorator";
import { HospitalScopeGuard } from "../common/guards/hospital-scope.guard";
import type { HospitalScope } from "../common/hospital-scope.types";
import { getMonitoringConfig } from "./monitoring.constants";
import { MonitoringEventsService } from "./monitoring-events.service";

@Controller("monitoring")
@UseGuards(HospitalScopeGuard)
export class SseController {
  private readonly keepaliveMs: number;

  constructor(
    private readonly events: MonitoringEventsService,
    configService: ConfigService,
  ) {
    this.keepaliveMs = getMonitoringConfig(configService).sseKeepaliveMs;
  }

  @Get("stream")
  stream(@HospitalCtx() scope: HospitalScope, @Res() res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const unsubscribe = this.events.subscribe(scope.hospitalId, (event) => {
      res.write(`event: statusUpdate\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    const keepalive = setInterval(() => {
      res.write(`: keepalive ${Date.now()}\n\n`);
    }, this.keepaliveMs);

    res.on("close", () => {
      clearInterval(keepalive);
      unsubscribe();
      res.end();
    });
  }
}
