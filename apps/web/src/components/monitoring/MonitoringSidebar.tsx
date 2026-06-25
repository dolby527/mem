"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { DomainNode, SidebarViewMode, TreeNode } from "@/lib/navigation/types";
import { DomainTree } from "./DomainTree";
import { LocationTree } from "./LocationTree";
import { ViewModeTabs } from "./ViewModeTabs";
import * as layout from "@/app/(app)/monitoring/layout.css";

interface MonitoringSidebarProps {
  locationTree: TreeNode[];
  domainTree: DomainNode[];
  children: ReactNode;
}

function SidebarTree({
  view,
  locationTree,
  domainTree,
}: {
  view: SidebarViewMode;
  locationTree: TreeNode[];
  domainTree: DomainNode[];
}) {
  return view === "domain" ? (
    <DomainTree nodes={domainTree} />
  ) : (
    <LocationTree roots={locationTree} />
  );
}

export function MonitoringSidebar({
  locationTree,
  domainTree,
  children,
}: MonitoringSidebarProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const view = (params.get("view") ?? "spatial") as SidebarViewMode;

  if (pathname.includes("/equipments/")) {
    return (
      <div className={layout.monitoringShell}>
        <div className={layout.contentColumn}>{children}</div>
      </div>
    );
  }

  const tree = (
    <Suspense fallback={null}>
      <SidebarTree
        view={view}
        locationTree={locationTree}
        domainTree={domainTree}
      />
    </Suspense>
  );

  return (
    <div className={layout.monitoringShell}>
      <div className={layout.monitoringLayout}>
        <div className={layout.treePanelMobile}>
          <ViewModeTabs />
          {tree}
        </div>
        <aside className={layout.treePanel} aria-label="장비 탐색 트리">
          <ViewModeTabs />
          {tree}
        </aside>
        <div className={layout.contentColumn}>{children}</div>
      </div>
    </div>
  );
}
