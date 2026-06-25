import { Suspense } from "react";
import { MonitoringSidebar } from "@/components/monitoring/MonitoringSidebar";
import { buildDomainTree } from "@/lib/navigation/domain";
import { buildLocationTree } from "@/lib/navigation/build-location-tree";
import { fetchEquipmentList } from "@/lib/data/equipment";
import { loadHospitals } from "@/lib/seed/load-seed";

export default async function MonitoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const equipment = await fetchEquipmentList();
  const hospitals = loadHospitals();
  const hospitalNames = new Map(hospitals.map((h) => [h.slug, h.name]));
  const locationTree = buildLocationTree(equipment, hospitalNames);
  const domainTree = buildDomainTree(equipment);

  return (
    <Suspense fallback={null}>
      <MonitoringSidebar locationTree={locationTree} domainTree={domainTree}>
        {children}
      </MonitoringSidebar>
    </Suspense>
  );
}
