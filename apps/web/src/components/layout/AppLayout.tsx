"use client";

import type { ReactNode } from "react";
import { MonitoringLiveProvider } from "@/components/MonitoringLiveProvider";
import { AppBottomNav } from "./AppBottomNav";
import * as s from "./AppLayout.css";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={s.root}>
      <MonitoringLiveProvider>
        <main className={s.main}>{children}</main>
      </MonitoringLiveProvider>
      <AppBottomNav />
    </div>
  );
}
