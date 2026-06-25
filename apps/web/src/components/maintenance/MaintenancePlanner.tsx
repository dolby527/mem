"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  bulkImportSchedules,
  createMaintenanceSchedule,
  deleteMaintenanceSchedule,
  generateRecurrenceSchedules,
  listMaintenanceSchedules,
  updateMaintenanceSchedule,
  type ApiMaintenanceSchedule,
  type BulkImportRow,
} from "@/lib/api/maintenance.api";
import { listEquipment, type ApiEquipment } from "@/lib/api/equipment.api";
import { listHospitalMembers, type ApiHospitalMember } from "@/lib/api/users.api";
import { formatEquipmentLocationLabel } from "@/lib/equipment/equipment-tree";
import { notifyMaintenanceChanged } from "@/lib/maintenance-events";
import {
  MAINTENANCE_SCHEDULE_STATUS_LABELS,
  MAINTENANCE_TYPE_LABELS,
  RECURRENCE_INTERVAL_LABELS,
  type MaintenanceScheduleStatus,
  type MaintenanceScheduleType,
  type RecurrenceInterval,
} from "@/lib/maintenance-schedule";
import { equipmentDetailPath } from "@/lib/navigation/paths";
import { useAuth } from "@/providers/AuthProvider";
import {
  EquipmentTreeMultiPicker,
  EquipmentTreePicker,
} from "@/components/maintenance/EquipmentTreePicker";
import * as form from "@/components/EquipmentForm.css";
import * as l from "@/styles/layout.css";
import * as s from "./MaintenancePlanner.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const TYPES = Object.keys(MAINTENANCE_TYPE_LABELS) as MaintenanceScheduleType[];
const INTERVALS = Object.keys(
  RECURRENCE_INTERVAL_LABELS,
) as RecurrenceInterval[];
const STATUSES = Object.keys(
  MAINTENANCE_SCHEDULE_STATUS_LABELS,
) as MaintenanceScheduleStatus[];

const ACTIVE_STATUSES: MaintenanceScheduleStatus[] = [
  "SCHEDULED",
  "IN_PROGRESS",
  "OVERDUE",
];

type TabId = "single" | "recurrence" | "bulk";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateOnly(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthRange(year: number, month: number) {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);
  return { from: toDateOnly(from), to: toDateOnly(to) };
}

function weekRangeFromToday() {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 7);
  return { from: toDateOnly(from), to: toDateOnly(to) };
}

function parseCsv(text: string): BulkImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const start =
    lines[0].toLowerCase().includes("equipmentslug") ||
    lines[0].includes("장비")
      ? 1
      : 0;

  return lines.slice(start).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const [
      equipmentSlug,
      maintenanceType,
      scheduledDate,
      assignedEmail,
      templateCode,
      vendorEngineer,
      estimatedHours,
      notes,
    ] = cols;
    return {
      equipmentSlug,
      maintenanceType: maintenanceType as MaintenanceScheduleType,
      scheduledDate,
      assignedEmail: assignedEmail || undefined,
      templateCode: templateCode || undefined,
      vendorEngineer: vendorEngineer || undefined,
      estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
      notes: notes || undefined,
    };
  });
}

interface MaintenancePlannerProps {
  templates: { id: string; name: string }[];
}

export function MaintenancePlanner({ templates }: MaintenancePlannerProps) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const canManage =
    user?.role === "HOSPITAL_ADMIN" || user?.role === "PLATFORM_ADMIN";

  const statusFilter = searchParams.get("status") as
    | MaintenanceScheduleStatus
    | null;
  const rangeFilter = searchParams.get("range");

  const [tab, setTab] = useState<TabId>("single");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [schedules, setSchedules] = useState<ApiMaintenanceSchedule[]>([]);
  const [equipment, setEquipment] = useState<ApiEquipment[]>([]);
  const [members, setMembers] = useState<ApiHospitalMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);

  const [equipmentSlug, setEquipmentSlug] = useState("");
  const [maintenanceType, setMaintenanceType] =
    useState<MaintenanceScheduleType>("PM");
  const [scheduledDate, setScheduledDate] = useState(toDateOnly(new Date()));
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [vendorEngineer, setVendorEngineer] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [notes, setNotes] = useState("");
  const [recurrenceInterval, setRecurrenceInterval] =
    useState<RecurrenceInterval>("QUARTERLY");
  const [rangeEndDate, setRangeEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return toDateOnly(d);
  });
  const [extraSlugs, setExtraSlugs] = useState<string[]>([]);
  const [csvText, setCsvText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      let query: {
        from?: string;
        to?: string;
        status?: MaintenanceScheduleStatus;
      };
      if (rangeFilter === "week") {
        query = { ...weekRangeFromToday(), status: statusFilter ?? undefined };
      } else if (statusFilter) {
        query = { status: statusFilter };
      } else {
        query = {};
      }
      const rows = await listMaintenanceSchedules(query);
      setSchedules(rows);
    } catch (e) {
      setMessage({
        kind: "error",
        text: e instanceof Error ? e.message : "일정을 불러오지 못했습니다.",
      });
    } finally {
      setLoading(false);
    }
  }, [rangeFilter, statusFilter]);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    void Promise.all([listEquipment(), listHospitalMembers()])
      .then(([eq, mem]) => {
        setEquipment(eq);
        setMembers(mem);
        if (eq[0]) {
          setEquipmentSlug((prev) => prev || eq[0].equipmentSlug);
        }
      })
      .catch(() => {
        /* optional */
      });
  }, []);

  const calendarDays = useMemo(() => {
    const first = new Date(month.year, month.month, 1);
    const last = new Date(month.year, month.month + 1, 0);
    const startPad = first.getDay();
    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < startPad; i += 1) {
      const d = new Date(month.year, month.month, 1 - (startPad - i));
      days.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= last.getDate(); d += 1) {
      days.push({ date: new Date(month.year, month.month, d), inMonth: true });
    }
    while (days.length % 7 !== 0) {
      const d = new Date(
        month.year,
        month.month + 1,
        days.length - startPad - last.getDate() + 1,
      );
      days.push({ date: d, inMonth: false });
    }
    return days;
  }, [month]);

  const monthSchedules = useMemo(() => {
    const { from, to } = monthRange(month.year, month.month);
    return schedules.filter(
      (row) => row.scheduledDate >= from && row.scheduledDate <= to,
    );
  }, [schedules, month.year, month.month]);

  const displaySchedules = useMemo(() => {
    if (rangeFilter === "week") {
      const { from, to } = weekRangeFromToday();
      return schedules.filter(
        (row) => row.scheduledDate >= from && row.scheduledDate <= to,
      );
    }
    if (statusFilter) {
      return schedules;
    }
    return schedules.filter((row) => ACTIVE_STATUSES.includes(row.status));
  }, [schedules, statusFilter, rangeFilter]);

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, ApiMaintenanceSchedule[]>();
    for (const row of monthSchedules) {
      const key = row.scheduledDate;
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return map;
  }, [monthSchedules]);

  const ganttRange = useMemo(() => {
    const { from, to } = monthRange(month.year, month.month);
    return {
      start: new Date(from).getTime(),
      end: new Date(to).getTime() + 86400000,
    };
  }, [month]);

  const uniqueEquipment = useMemo(() => {
    const seen = new Set<string>();
    return monthSchedules.filter((row) => {
      if (seen.has(row.equipmentSlug)) return false;
      seen.add(row.equipmentSlug);
      return true;
    });
  }, [monthSchedules]);

  async function handleCreateSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await createMaintenanceSchedule({
        equipmentSlug,
        maintenanceType,
        scheduledDate,
        assignedToUserId: assignedToUserId || undefined,
        vendorEngineer: vendorEngineer || undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        templateId: templateId || undefined,
        notes: notes || undefined,
      });
      setMessage({ kind: "success", text: "보전 일정을 등록했습니다." });
      notifyMaintenanceChanged();
      await loadSchedules();
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "등록에 실패했습니다.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecurrence(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await generateRecurrenceSchedules({
        equipmentSlug,
        equipmentSlugs: extraSlugs.length > 0 ? extraSlugs : undefined,
        maintenanceType,
        scheduledDate,
        recurrenceInterval,
        rangeEndDate,
        assignedToUserId: assignedToUserId || undefined,
        templateId: templateId || undefined,
        notes: notes || undefined,
      });
      setMessage({
        kind: "success",
        text: `${String(result.count)}건의 반복 일정을 생성했습니다.`,
      });
      notifyMaintenanceChanged();
      await loadSchedules();
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "생성에 실패했습니다.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkImport(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      setMessage({ kind: "error", text: "CSV 데이터가 없습니다." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await bulkImportSchedules(rows);
      const errCount = result.errors?.length ?? 0;
      setMessage({
        kind: errCount > 0 ? "error" : "success",
        text:
          errCount > 0
            ? `${String(result.count)}건 등록, ${String(errCount)}건 오류`
            : `${String(result.count)}건 일괄 등록했습니다.`,
      });
      notifyMaintenanceChanged();
      await loadSchedules();
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "일괄 등록에 실패했습니다.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(
    id: string,
    status: MaintenanceScheduleStatus,
  ) {
    try {
      await updateMaintenanceSchedule(id, { status });
      notifyMaintenanceChanged();
      await loadSchedules();
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "상태 변경 실패",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!canManage) return;
    if (!window.confirm("이 일정을 삭제할까요?")) return;
    try {
      await deleteMaintenanceSchedule(id);
      notifyMaintenanceChanged();
      await loadSchedules();
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "삭제 실패",
      });
    }
  }

  const csvPreview = useMemo(() => parseCsv(csvText).slice(0, 5), [csvText]);
  const todayStr = toDateOnly(new Date());

  return (
    <div className={s.plannerRoot}>
      {message && (
        <p className={s.message({ kind: message.kind })}>{message.text}</p>
      )}

      <div className={s.splitLayout}>
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <h3 className={s.panelTitle}>일정 등록</h3>
          </div>
          <div className={s.panelBody}>
            {!canManage && (
              <p className={s.csvHint}>
                일정 등록·삭제는 병원 관리자만 가능합니다. 배정된 일정은
                상태 변경만 할 수 있습니다.
              </p>
            )}
            <div className={s.tabRow}>
              {(
                [
                  ["single", "단일"],
                  ["recurrence", "반복"],
                  ["bulk", "CSV"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={s.tabBtn({ active: tab === id })}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "single" && (
              <form className={form.form} onSubmit={(e) => void handleCreateSingle(e)}>
                <ScheduleFields
                  equipment={equipment}
                  members={members}
                  templates={templates}
                  equipmentSlug={equipmentSlug}
                  setEquipmentSlug={setEquipmentSlug}
                  maintenanceType={maintenanceType}
                  setMaintenanceType={setMaintenanceType}
                  scheduledDate={scheduledDate}
                  setScheduledDate={setScheduledDate}
                  assignedToUserId={assignedToUserId}
                  setAssignedToUserId={setAssignedToUserId}
                  vendorEngineer={vendorEngineer}
                  setVendorEngineer={setVendorEngineer}
                  estimatedHours={estimatedHours}
                  setEstimatedHours={setEstimatedHours}
                  templateId={templateId}
                  setTemplateId={setTemplateId}
                  notes={notes}
                  setNotes={setNotes}
                  disabled={!canManage}
                />
                {canManage && (
                  <div className={form.actions}>
                    <button
                      type="submit"
                      className={form.buttonPrimary}
                      disabled={submitting}
                    >
                      등록
                    </button>
                  </div>
                )}
              </form>
            )}

            {tab === "recurrence" && (
              <form className={form.form} onSubmit={(e) => void handleRecurrence(e)}>
                <ScheduleFields
                  equipment={equipment}
                  members={members}
                  templates={templates}
                  equipmentSlug={equipmentSlug}
                  setEquipmentSlug={setEquipmentSlug}
                  maintenanceType={maintenanceType}
                  setMaintenanceType={setMaintenanceType}
                  scheduledDate={scheduledDate}
                  setScheduledDate={setScheduledDate}
                  assignedToUserId={assignedToUserId}
                  setAssignedToUserId={setAssignedToUserId}
                  vendorEngineer={vendorEngineer}
                  setVendorEngineer={setVendorEngineer}
                  estimatedHours={estimatedHours}
                  setEstimatedHours={setEstimatedHours}
                  templateId={templateId}
                  setTemplateId={setTemplateId}
                  notes={notes}
                  setNotes={setNotes}
                  disabled={!canManage}
                />
                <div className={form.field}>
                  <label className={form.label} htmlFor="recurrenceInterval">
                    반복 주기
                  </label>
                  <select
                    id="recurrenceInterval"
                    className={form.input}
                    value={recurrenceInterval}
                    disabled={!canManage}
                    onChange={(e) =>
                      setRecurrenceInterval(e.target.value as RecurrenceInterval)
                    }
                  >
                    {INTERVALS.filter((i) => i !== "NONE").map((i) => (
                      <option key={i} value={i}>
                        {RECURRENCE_INTERVAL_LABELS[i]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={form.field}>
                  <label className={form.label} htmlFor="rangeEndDate">
                    반복 종료일
                  </label>
                  <input
                    id="rangeEndDate"
                    type="date"
                    className={form.input}
                    value={rangeEndDate}
                    disabled={!canManage}
                    onChange={(e) => setRangeEndDate(e.target.value)}
                  />
                </div>
                <div className={form.field}>
                  <span className={form.label}>추가 장비</span>
                  <EquipmentTreeMultiPicker
                    equipment={equipment}
                    selectedSlugs={extraSlugs}
                    onChange={setExtraSlugs}
                    excludeSlug={equipmentSlug}
                    disabled={!canManage}
                  />
                </div>
                {canManage && (
                  <div className={form.actions}>
                    <button
                      type="submit"
                      className={form.buttonPrimary}
                      disabled={submitting}
                    >
                      반복 생성
                    </button>
                  </div>
                )}
              </form>
            )}

            {tab === "bulk" && (
              <form className={form.form} onSubmit={(e) => void handleBulkImport(e)}>
                <p className={s.csvHint}>
                  CSV: equipmentSlug, maintenanceType, scheduledDate,
                  assignedEmail, templateCode, vendorEngineer, estimatedHours,
                  notes
                </p>
                <textarea
                  className={form.textarea}
                  rows={8}
                  value={csvText}
                  disabled={!canManage}
                  placeholder="asan-siemens-magnetom-skyra-3t-mri,PM,2026-07-01,admin@asan.dev,3T MRI 정기 PM"
                  onChange={(e) => setCsvText(e.target.value)}
                />
                {csvPreview.length > 0 && (
                  <table className={s.previewTable}>
                    <thead>
                      <tr>
                        <th className={s.previewTh}>장비</th>
                        <th className={s.previewTh}>유형</th>
                        <th className={s.previewTh}>일자</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i}>
                          <td className={s.previewTd}>{row.equipmentSlug}</td>
                          <td className={s.previewTd}>{row.maintenanceType}</td>
                          <td className={s.previewTd}>{row.scheduledDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {canManage && (
                  <div className={form.actions}>
                    <button
                      type="submit"
                      className={form.buttonPrimary}
                      disabled={submitting}
                    >
                      일괄 등록
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.panelBody}>
            <div className={s.calendarHeader}>
              <button
                type="button"
                className={s.calendarNavBtn}
                aria-label="이전 달"
                onClick={() =>
                  setMonth((m) => {
                    const d = new Date(m.year, m.month - 1, 1);
                    return { year: d.getFullYear(), month: d.getMonth() };
                  })
                }
              >
                ‹
              </button>
              <h3 className={s.calendarTitle}>
                {month.year}년 {month.month + 1}월
                {statusFilter
                  ? ` · ${MAINTENANCE_SCHEDULE_STATUS_LABELS[statusFilter]}`
                  : ""}
              </h3>
              <button
                type="button"
                className={s.calendarNavBtn}
                aria-label="다음 달"
                onClick={() =>
                  setMonth((m) => {
                    const d = new Date(m.year, m.month + 1, 1);
                    return { year: d.getFullYear(), month: d.getMonth() };
                  })
                }
              >
                ›
              </button>
            </div>

            <div className={s.calendarGrid}>
              {WEEKDAYS.map((w) => (
                <div key={w} className={s.calendarWeekday}>
                  {w}
                </div>
              ))}
              {calendarDays.map(({ date, inMonth }) => {
                const key = toDateOnly(date);
                const daySchedules = schedulesByDate.get(key) ?? [];
                return (
                  <div
                    key={key + String(inMonth)}
                    className={s.calendarDay({
                      muted: !inMonth,
                      today: key === todayStr,
                    })}
                  >
                    <span className={s.calendarDayNum}>{date.getDate()}</span>
                    {daySchedules.slice(0, 3).map((row) => (
                      <span
                        key={row.id}
                        className={s.calendarDot({ status: row.status })}
                        title={row.equipmentName}
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            <div className={s.scheduleList}>
              <h4 className={s.scheduleListTitle}>간트 (월간)</h4>
              {uniqueEquipment.length === 0 && !loading && (
                <p className={s.csvHint}>표시할 일정이 없습니다.</p>
              )}
              {uniqueEquipment.map((eq) => {
                const eqSchedules = monthSchedules.filter(
                  (r) => r.equipmentSlug === eq.equipmentSlug,
                );
                return (
                  <div key={eq.equipmentSlug} className={s.ganttRow}>
                    <span className={s.ganttLabel} title={eq.equipmentName}>
                      {eq.equipmentName}
                    </span>
                    <div className={s.ganttTrack}>
                      {eqSchedules.map((row) => {
                        const t = new Date(row.scheduledDate).getTime();
                        const span = ganttRange.end - ganttRange.start;
                        const left = ((t - ganttRange.start) / span) * 100;
                        return (
                          <span
                            key={row.id}
                            className={s.ganttBar({ status: row.status })}
                            style={{
                              left: `${Math.max(0, Math.min(98, left))}%`,
                              width: "8px",
                            }}
                            title={`${row.scheduledDate} ${MAINTENANCE_TYPE_LABELS[row.maintenanceType]}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={s.scheduleList}>
              <h4 className={s.scheduleListTitle}>
                일정 목록{" "}
                {loading
                  ? "(불러오는 중…)"
                  : `(${displaySchedules.length})`}
                {statusFilter
                  ? ` · ${MAINTENANCE_SCHEDULE_STATUS_LABELS[statusFilter]}`
                  : rangeFilter === "week"
                    ? " · 7일 이내"
                    : " · 미완료 전체"}
              </h4>
              <div className={l.tableWrap}>
                <table className={l.table}>
                  <thead className={l.tableHead}>
                    <tr>
                      <th className={`${l.th} ${s.scheduleDateCell}`}>일자</th>
                      <th className={l.th}>장비</th>
                      <th className={l.thHiddenMobile}>유형</th>
                      <th className={`${l.thHiddenMobile} ${s.scheduleAssigneeCell}`}>
                        담당
                      </th>
                      <th className={`${l.th} ${s.scheduleActionsCell}`}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaySchedules.map((row) => (
                      <tr key={row.id} className={l.tr}>
                        <td className={`${l.td} ${s.scheduleDateCell}`}>
                          {row.scheduledDate}
                        </td>
                        <td className={`${l.td} ${s.scheduleEquipmentCell}`}>
                          <Link
                            href={equipmentDetailPath(row.equipmentSlug)}
                            className={l.tableLink}
                          >
                            {row.equipmentName}
                          </Link>
                          <p className={s.scheduleEquipmentMeta}>
                            {formatEquipmentLocationLabel(row)}
                          </p>
                          <p className={s.scheduleEquipmentId}>
                            장비ID: {row.equipmentSlug}
                          </p>
                        </td>
                        <td className={l.tdHiddenMobile}>
                          {MAINTENANCE_TYPE_LABELS[row.maintenanceType]}
                        </td>
                        <td
                          className={`${l.tdHiddenMobile} ${s.scheduleAssigneeCell}`}
                          title={
                            row.assignedTo?.name ?? row.vendorEngineer ?? undefined
                          }
                        >
                          {row.assignedTo?.name ?? row.vendorEngineer ?? "—"}
                        </td>
                        <td className={`${l.td} ${s.scheduleActionsCell}`}>
                          <div className={s.rowActions}>
                            <select
                              className={s.smallSelect}
                              value={row.status}
                              onChange={(e) =>
                                void handleStatusChange(
                                  row.id,
                                  e.target.value as MaintenanceScheduleStatus,
                                )
                              }
                            >
                              {STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {MAINTENANCE_SCHEDULE_STATUS_LABELS[st]}
                                </option>
                              ))}
                            </select>
                            {canManage && (
                              <button
                                type="button"
                                className={s.dangerBtn}
                                onClick={() => void handleDelete(row.id)}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleFields(props: {
  equipment: ApiEquipment[];
  members: ApiHospitalMember[];
  templates: { id: string; name: string }[];
  equipmentSlug: string;
  setEquipmentSlug: (v: string) => void;
  maintenanceType: MaintenanceScheduleType;
  setMaintenanceType: (v: MaintenanceScheduleType) => void;
  scheduledDate: string;
  setScheduledDate: (v: string) => void;
  assignedToUserId: string;
  setAssignedToUserId: (v: string) => void;
  vendorEngineer: string;
  setVendorEngineer: (v: string) => void;
  estimatedHours: string;
  setEstimatedHours: (v: string) => void;
  templateId: string;
  setTemplateId: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <div className={form.field}>
        <span className={form.label} id="equipment-tree-label">
          장비 선택
        </span>
        <EquipmentTreePicker
          equipment={props.equipment}
          selectedSlug={props.equipmentSlug}
          onSelect={props.setEquipmentSlug}
          disabled={props.disabled}
        />
      </div>
      <div className={form.field}>
        <label className={form.label} htmlFor="maintenanceType">
          보전 유형
        </label>
        <select
          id="maintenanceType"
          className={form.input}
          value={props.maintenanceType}
          disabled={props.disabled}
          onChange={(e) =>
            props.setMaintenanceType(e.target.value as MaintenanceScheduleType)
          }
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {MAINTENANCE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div className={form.field}>
        <label className={form.label} htmlFor="scheduledDate">
          예정일
        </label>
        <input
          id="scheduledDate"
          type="date"
          className={form.input}
          value={props.scheduledDate}
          disabled={props.disabled}
          onChange={(e) => props.setScheduledDate(e.target.value)}
        />
      </div>
      <div className={form.field}>
        <label className={form.label} htmlFor="assignedTo">
          내부 담당
        </label>
        <select
          id="assignedTo"
          className={form.input}
          value={props.assignedToUserId}
          disabled={props.disabled}
          onChange={(e) => props.setAssignedToUserId(e.target.value)}
        >
          <option value="">—</option>
          {props.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>
      </div>
      <div className={form.field}>
        <label className={form.label} htmlFor="vendorEngineer">
          외부 엔지니어
        </label>
        <input
          id="vendorEngineer"
          className={form.input}
          value={props.vendorEngineer}
          disabled={props.disabled}
          onChange={(e) => props.setVendorEngineer(e.target.value)}
        />
      </div>
      <div className={form.field}>
        <label className={form.label} htmlFor="estimatedHours">
          예상 시간(h)
        </label>
        <input
          id="estimatedHours"
          type="number"
          step="0.5"
          className={form.input}
          value={props.estimatedHours}
          disabled={props.disabled}
          onChange={(e) => props.setEstimatedHours(e.target.value)}
        />
      </div>
      <div className={form.field}>
        <label className={form.label} htmlFor="templateId">
          체크리스트 템플릿
        </label>
        <select
          id="templateId"
          className={form.input}
          value={props.templateId}
          disabled={props.disabled}
          onChange={(e) => props.setTemplateId(e.target.value)}
        >
          <option value="">—</option>
          {props.templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className={form.field}>
        <label className={form.label} htmlFor="notes">
          메모
        </label>
        <textarea
          id="notes"
          className={form.textarea}
          value={props.notes}
          disabled={props.disabled}
          onChange={(e) => props.setNotes(e.target.value)}
        />
      </div>
    </>
  );
}
