import { notFound } from "next/navigation";
import { EquipmentDetailToolbar } from "@/components/equipment/EquipmentDetailToolbar";
import { HealthCheckHistorySection } from "@/components/equipment/HealthCheckHistorySection";
import { EquipmentThumbnail } from "@/components/EquipmentThumbnail";
import { LiveStatusBadge } from "@/components/LiveStatusBadge";
import { MaintenanceBadge } from "@/components/MaintenanceBadge";
import { fetchEquipmentBySlug } from "@/lib/data/equipment";
import { fetchInitialHealthCheckHistory } from "@/lib/data/health-checks";
import { formatManufacturedDate } from "@/lib/datetime";
import { HEALTH_CHECK_HISTORY_PAGE_SIZE } from "@/lib/monitoring/constants";
import { resolveDomainPath, DOMAIN_GROUPS } from "@/lib/navigation/domain";
import { formatSpatialLabel, inferSpatialPath } from "@/lib/navigation/spatial";
import * as l from "@/styles/layout.css";

interface EquipmentDetailPageProps {
  params: Promise<{ equipmentId: string }>;
}

import { StatusSourceBadge } from "@/components/equipment/StatusSourceBadge";
import { formatPrimarySourceLabel } from "@/lib/status-source";

function domainLabels(domainId: string, subId: string) {
  const group = DOMAIN_GROUPS.find((g) => g.id === domainId);
  const sub = group?.subs.find((s) => s.id === subId);
  return [group?.label, sub?.label].filter(Boolean).join(" › ");
}

export default async function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
  const { equipmentId } = await params;
  const item = await fetchEquipmentBySlug(equipmentId);

  if (!item) notFound();

  const history = await fetchInitialHealthCheckHistory(
    equipmentId,
    item.demoStatus,
  );
  const spatial = inferSpatialPath(item);
  const domain = resolveDomainPath(item);

  return (
    <div className={l.pageContainerNarrow}>
      <EquipmentDetailToolbar
        equipmentSlug={equipmentId}
        equipmentName={item.name}
      />

      <article className={l.card}>
        <div className={l.detailHero}>
          <EquipmentThumbnail
            item={item}
            imageClassName={l.detailHeroImage}
            priority
          />
        </div>
        <div className={l.cardBody}>
          <div className={l.detailHeaderRow}>
            <div>
              <h2 className={l.detailTitle}>{item.name}</h2>
              <p className={l.detailSubtitle}>{formatSpatialLabel(item)}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <LiveStatusBadge
                equipmentSlug={item.equipmentSlug}
                fallback={item.demoStatus}
              />
              <MaintenanceBadge status={item.maintenanceStatus} />
            </div>
          </div>

          <dl className={l.definitionList}>
            <div>
              <dt className={l.definitionTerm}>위치 (공간)</dt>
              <dd className={l.definitionDetail}>
                {spatial.building} · {spatial.floor} · {spatial.room}
              </dd>
            </div>
            <div>
              <dt className={l.definitionTerm}>기능/품목</dt>
              <dd className={l.definitionDetail}>
                {domainLabels(domain.domainId, domain.subId)}
              </dd>
            </div>
            <div>
              <dt className={l.definitionTerm}>제조사 / 모델</dt>
              <dd className={l.definitionDetail}>
                {[item.manufacturer, item.model].filter(Boolean).join(" · ") || "—"}
              </dd>
            </div>
            <div>
              <dt className={l.definitionTerm}>제조연월일</dt>
              <dd className={l.definitionDetail}>
                {formatManufacturedDate(item.manufacturedAt)}
              </dd>
            </div>
            <div>
              <dt className={l.definitionTerm}>Primary 소스</dt>
              <dd className={l.definitionDetail}>
                {formatPrimarySourceLabel(
                  item.statusSourceType,
                  item.vendorInterfaceType,
                )}
              </dd>
            </div>
            {item.fallbackSourceType && (
              <div>
                <dt className={l.definitionTerm}>Fallback</dt>
                <dd className={l.definitionDetail}>{item.fallbackSourceType}</dd>
              </div>
            )}
            {item.vendorDeviceId && (
              <div>
                <dt className={l.definitionTerm}>벤더 장비 ID</dt>
                <dd className={l.definitionDetail}>
                  <code className={l.inlineCode}>{item.vendorDeviceId}</code>
                </dd>
              </div>
            )}
            <div>
              <dt className={l.definitionTerm}>최근 판별</dt>
              <dd className={l.definitionDetail}>
                <StatusSourceBadge
                  statusSourceType={item.statusSourceType}
                  statusResolvedFrom={item.statusResolvedFrom}
                  vendorInterfaceType={item.vendorInterfaceType}
                  fallbackSourceType={item.fallbackSourceType}
                />
              </dd>
            </div>
            <div>
              <dt className={l.definitionTerm}>장비 ID</dt>
              <dd className={l.definitionDetail}>
                <code className={l.inlineCode}>{item.equipmentSlug}</code>
              </dd>
            </div>
            <div>
              <dt className={l.definitionTerm}>분류 (마스터)</dt>
              <dd className={l.definitionDetail}>{item.category}</dd>
            </div>
          </dl>

          {item.statusSourceTypeReason && (
            <p className={l.noteBox}>{item.statusSourceTypeReason}</p>
          )}
        </div>
      </article>

      <section className={l.section}>
        <h3 className={l.sectionTitle}>상태 변경 이력</h3>
        <p className={l.sectionHint}>
          상태 변경 시에만 기록 · {HEALTH_CHECK_HISTORY_PAGE_SIZE}건씩 조회 (더
          보기)
        </p>
        <HealthCheckHistorySection
          equipmentSlug={equipmentId}
          initialEntries={history.entries}
          initialNextCursor={history.nextCursor}
          mockFallback={history.mockFallback}
        />
      </section>
    </div>
  );
}
