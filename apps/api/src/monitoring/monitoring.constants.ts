import { ConfigService } from "@nestjs/config";

function intEnv(config: ConfigService, key: string, fallback: number): number {
  const raw = config.get<string>(key);
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function getMonitoringConfig(config: ConfigService) {
  return {
    healthCheckIntervalMs: intEnv(config, "HEALTH_CHECK_INTERVAL_MS", 30_000),
    healthCheckBatchSize: intEnv(config, "HEALTH_CHECK_BATCH_SIZE", 50),
    healthCheckTimeoutMs: intEnv(config, "HEALTH_CHECK_TIMEOUT_MS", 5_000),
    pingFailureThreshold: intEnv(config, "PING_FAILURE_THRESHOLD", 3),
    interfaceVendorStaleMs: intEnv(
      config,
      "INTERFACE_VENDOR_STALE_MS",
      300_000,
    ),
    agentHeartbeatStaleMs: intEnv(config, "AGENT_HEARTBEAT_STALE_MS", 60_000),
    iotReadingStaleMs: intEnv(config, "IOT_READING_STALE_MS", 120_000),
    sseKeepaliveMs: intEnv(config, "SSE_KEEPALIVE_MS", 15_000),
    healthCheckSimulate:
      config.get<string>("HEALTH_CHECK_SIMULATE") === "true" ||
      config.get<string>("HEALTH_CHECK_SIMULATE") === "1",
  };
}

export type MonitoringConfig = ReturnType<typeof getMonitoringConfig>;
