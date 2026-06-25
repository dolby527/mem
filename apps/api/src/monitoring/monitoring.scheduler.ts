import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getMonitoringConfig } from "./monitoring.constants";
import { HealthCheckService } from "./health-check.service";

@Injectable()
export class MonitoringScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonitoringScheduler.name);
  private timer?: ReturnType<typeof setInterval>;
  private readonly intervalMs: number;

  constructor(
    private readonly healthCheck: HealthCheckService,
    configService: ConfigService,
  ) {
    this.intervalMs = getMonitoringConfig(configService).healthCheckIntervalMs;
  }

  onModuleInit() {
    this.logger.log(`Health check every ${this.intervalMs}ms`);
    this.timer = setInterval(() => {
      void this.healthCheck.runBatch().catch((err) => {
        this.logger.error("Health check batch failed", err);
      });
    }, this.intervalMs);

    setTimeout(() => {
      void this.healthCheck.runBatch().catch((err) => {
        this.logger.error("Initial health check failed", err);
      });
    }, 3_000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
