import type { HealthCheckEntry } from "@/lib/types";
import { formatDateTimeKorea } from "@/lib/datetime";
import { StatusBadge } from "@/components/StatusBadge";
import {
  timelineContent,
  timelineDot,
  timelineItem,
  timelineList,
  timelineMeta,
  timelineRow,
  timelineTime,
} from "@/styles/status.css";

interface HealthCheckTimelineProps {
  entries: HealthCheckEntry[];
}

export function HealthCheckTimeline({ entries }: HealthCheckTimelineProps) {
  return (
    <ol className={timelineList}>
      {entries.map((entry) => (
        <li key={entry.id} className={timelineItem}>
          <span className={timelineDot({ status: entry.status })} aria-hidden />
          <div className={timelineContent}>
            <div className={timelineRow}>
              <StatusBadge status={entry.status} size="sm" />
              <span className={timelineTime}>
                {formatDateTimeKorea(entry.checkedAt)}
              </span>
            </div>
            <p className={timelineMeta}>
              {entry.latencyMs != null ? `응답 ${entry.latencyMs}ms` : "응답 없음"}
              {entry.errorMessage ? ` · ${entry.errorMessage}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
