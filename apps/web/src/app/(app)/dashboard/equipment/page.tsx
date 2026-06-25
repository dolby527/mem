import { redirect } from "next/navigation";

interface LegacyDashboardEquipmentPageProps {
  searchParams: Promise<{
    category?: string;
    name?: string;
    source?: string;
  }>;
}

export default async function LegacyDashboardEquipmentRedirect({
  searchParams,
}: LegacyDashboardEquipmentPageProps) {
  const { category, name, source } = await searchParams;
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (name) params.set("name", name);
  if (source) params.set("source", source);
  const qs = params.toString();
  redirect(qs ? `/equipments/group?${qs}` : "/equipments");
}
