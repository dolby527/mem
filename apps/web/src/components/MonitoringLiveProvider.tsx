"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StatusUpdateEvent } from "@/lib/monitoring/types";
import { useMonitoringStream } from "@/lib/monitoring/use-monitoring-stream";
import type { EquipmentStatus } from "@/lib/types";

interface MonitoringLiveContextValue {
  statusBySlug: ReadonlyMap<string, EquipmentStatus>;
  checkedAtBySlug: ReadonlyMap<string, string>;
  statusSinceAtBySlug: ReadonlyMap<string, string>;
  getStatus: (equipmentSlug: string, fallback: EquipmentStatus) => EquipmentStatus;
  getLastCheckedAt: (
    equipmentSlug: string,
    fallback?: string | null,
  ) => string | null;
  getStatusSinceAt: (
    equipmentSlug: string,
    fallback?: string | null,
  ) => string | null;
  seedFromEquipment: (
    items: Array<{
      equipmentSlug: string;
      demoStatus: EquipmentStatus;
      lastCheckedAt?: string | null;
      statusSinceAt?: string | null;
    }>,
  ) => void;
  applyLiveUpdate: (event: StatusUpdateEvent) => void;
  subscribeStatusChange: (
    listener: (event: StatusUpdateEvent) => void,
  ) => () => void;
  connected: boolean;
}

const MonitoringLiveContext = createContext<MonitoringLiveContextValue | null>(
  null,
);

export function MonitoringLiveProvider({ children }: { children: ReactNode }) {
  const [statusBySlug, setStatusBySlug] = useState<
    Map<string, EquipmentStatus>
  >(() => new Map());
  const [checkedAtBySlug, setCheckedAtBySlug] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [statusSinceAtBySlug, setStatusSinceAtBySlug] = useState<
    Map<string, string>
  >(() => new Map());
  const [connected, setConnected] = useState(false);
  const statusChangeListenersRef = useRef(
    new Set<(event: StatusUpdateEvent) => void>(),
  );

  const applyEvent = useCallback((event: StatusUpdateEvent) => {
    setCheckedAtBySlug((prev) => {
      const next = new Map(prev);
      next.set(event.equipmentSlug, event.checkedAt);
      return next;
    });

    if (event.changed) {
      setStatusBySlug((prev) => {
        const next = new Map(prev);
        next.set(event.equipmentSlug, event.status);
        return next;
      });
      setStatusSinceAtBySlug((prev) => {
        const next = new Map(prev);
        next.set(event.equipmentSlug, event.statusSinceAt);
        return next;
      });
      statusChangeListenersRef.current.forEach((listener) => listener(event));
    }
  }, []);

  const onOpen = useCallback(() => setConnected(true), []);
  const onClose = useCallback(() => setConnected(false), []);

  useMonitoringStream(applyEvent, onOpen, onClose);

  const subscribeStatusChange = useCallback(
    (listener: (event: StatusUpdateEvent) => void) => {
      statusChangeListenersRef.current.add(listener);
      return () => {
        statusChangeListenersRef.current.delete(listener);
      };
    },
    [],
  );

  const seedFromEquipment = useCallback(
    (
      items: Array<{
        equipmentSlug: string;
        demoStatus: EquipmentStatus;
        lastCheckedAt?: string | null;
        statusSinceAt?: string | null;
      }>,
    ) => {
      setStatusBySlug((prev) => {
        const next = new Map(prev);
        for (const item of items) {
          if (!next.has(item.equipmentSlug)) {
            next.set(item.equipmentSlug, item.demoStatus);
          }
        }
        return next;
      });
      setCheckedAtBySlug((prev) => {
        const next = new Map(prev);
        for (const item of items) {
          if (item.lastCheckedAt && !next.has(item.equipmentSlug)) {
            next.set(item.equipmentSlug, item.lastCheckedAt);
          }
        }
        return next;
      });
      setStatusSinceAtBySlug((prev) => {
        const next = new Map(prev);
        for (const item of items) {
          if (item.statusSinceAt && !next.has(item.equipmentSlug)) {
            next.set(item.equipmentSlug, item.statusSinceAt);
          }
        }
        return next;
      });
    },
    [],
  );

  const value = useMemo<MonitoringLiveContextValue>(
    () => ({
      connected,
      statusBySlug,
      checkedAtBySlug,
      statusSinceAtBySlug,
      getStatus: (slug, fallback) => statusBySlug.get(slug) ?? fallback,
      getLastCheckedAt: (slug, fallback) =>
        checkedAtBySlug.get(slug) ?? fallback ?? null,
      getStatusSinceAt: (slug, fallback) =>
        statusSinceAtBySlug.get(slug) ?? fallback ?? null,
      seedFromEquipment,
      applyLiveUpdate: applyEvent,
      subscribeStatusChange,
    }),
    [
      connected,
      statusBySlug,
      checkedAtBySlug,
      statusSinceAtBySlug,
      seedFromEquipment,
      applyEvent,
      subscribeStatusChange,
    ],
  );

  return (
    <MonitoringLiveContext.Provider value={value}>
      {children}
    </MonitoringLiveContext.Provider>
  );
}

export function useMonitoringLive(): MonitoringLiveContextValue {
  const ctx = useContext(MonitoringLiveContext);
  if (!ctx) {
    return {
      statusBySlug: new Map(),
      checkedAtBySlug: new Map(),
      statusSinceAtBySlug: new Map(),
      connected: false,
      getStatus: (_slug, fallback) => fallback,
      getLastCheckedAt: (_slug, fallback) => fallback ?? null,
      getStatusSinceAt: (_slug, fallback) => fallback ?? null,
      seedFromEquipment: () => {},
      applyLiveUpdate: () => {},
      subscribeStatusChange: () => () => {},
    };
  }
  return ctx;
}

export function useLiveEquipmentStatus(
  equipmentSlug: string,
  fallback: EquipmentStatus,
): EquipmentStatus {
  return useMonitoringLive().getStatus(equipmentSlug, fallback);
}

export function useLiveLastCheckedAt(
  equipmentSlug: string,
  fallback?: string | null,
): string | null {
  return useMonitoringLive().getLastCheckedAt(equipmentSlug, fallback);
}

export function useLiveStatusSinceAt(
  equipmentSlug: string,
  fallback?: string | null,
): string | null {
  return useMonitoringLive().getStatusSinceAt(equipmentSlug, fallback);
}

export function useMonitoringLiveConnected(): boolean {
  return useMonitoringLive().connected;
}

export function useMonitoringLiveSeed() {
  return useMonitoringLive().seedFromEquipment;
}

export function useEquipmentStatusChange(
  equipmentSlug: string,
  onChange: (event: StatusUpdateEvent) => void,
) {
  const { subscribeStatusChange } = useMonitoringLive();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    return subscribeStatusChange((event) => {
      if (event.equipmentSlug !== equipmentSlug) return;
      if (!event.changed) return;
      onChangeRef.current(event);
    });
  }, [equipmentSlug, subscribeStatusChange]);
}
