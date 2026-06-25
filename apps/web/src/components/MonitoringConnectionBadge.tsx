"use client";

import { useMonitoringLiveConnected } from "./MonitoringLiveProvider";
import * as s from "./MonitoringConnectionBadge.css";

export function MonitoringConnectionBadge() {
  const connected = useMonitoringLiveConnected();

  return (
    <span className={s.badge({ connected })}>
      {connected ? "SSE 연결됨" : "SSE 대기"}
    </span>
  );
}
