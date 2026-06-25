"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createMaintenanceTemplate,
  deleteMaintenanceTemplate,
  listMaintenanceTemplates,
  updateMaintenanceTemplate,
  type ApiChecklistItem,
  type ApiMaintenanceTemplate,
} from "@/lib/api/maintenance.api";
import {
  MAINTENANCE_TYPE_LABELS,
  type MaintenanceScheduleType,
} from "@/lib/maintenance-schedule";
import { useAuth } from "@/providers/AuthProvider";
import * as form from "@/components/EquipmentForm.css";
import * as l from "@/styles/layout.css";
import * as s from "./MaintenancePlanner.css";

const TYPES = Object.keys(MAINTENANCE_TYPE_LABELS) as MaintenanceScheduleType[];

const EMPTY_ITEM = (): ApiChecklistItem => ({
  id: crypto.randomUUID(),
  label: "",
  required: true,
});

export function MaintenanceTemplatesPanel() {
  const { user } = useAuth();
  const canManage =
    user?.role === "HOSPITAL_ADMIN" || user?.role === "PLATFORM_ADMIN";

  const [templates, setTemplates] = useState<ApiMaintenanceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [maintenanceType, setMaintenanceType] =
    useState<MaintenanceScheduleType>("PM");
  const [items, setItems] = useState<ApiChecklistItem[]>([EMPTY_ITEM()]);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTemplates(await listMaintenanceTemplates());
    } catch (e) {
      setMessage({
        kind: "error",
        text: e instanceof Error ? e.message : "템플릿 로드 실패",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    const validItems = items.filter((i) => i.label.trim());
    if (!name.trim() || validItems.length === 0) {
      setMessage({ kind: "error", text: "이름과 체크리스트 항목을 입력하세요." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await createMaintenanceTemplate({
        name: name.trim(),
        manufacturer: manufacturer.trim() || undefined,
        maintenanceType,
        items: validItems,
      });
      setName("");
      setManufacturer("");
      setItems([EMPTY_ITEM()]);
      setMessage({ kind: "success", text: "템플릿을 등록했습니다." });
      await load();
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "등록 실패",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!canManage) return;
    if (!window.confirm("템플릿을 삭제할까요?")) return;
    try {
      await deleteMaintenanceTemplate(id);
      await load();
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "삭제 실패",
      });
    }
  }

  async function handleAddItem(template: ApiMaintenanceTemplate) {
    if (!canManage) return;
    const next = [
      ...(template.items as ApiChecklistItem[]),
      { id: crypto.randomUUID(), label: "새 항목", required: true },
    ];
    await updateMaintenanceTemplate(template.id, { items: next });
    await load();
  }

  return (
    <div className={s.plannerRoot}>
      {message && (
        <p className={s.message({ kind: message.kind })}>{message.text}</p>
      )}

      {canManage && (
        <form className={form.form} onSubmit={(e) => void handleCreate(e)}>
          <h3 className={l.sectionTitle}>새 체크리스트 템플릿</h3>
          <div className={form.grid}>
            <div className={form.field}>
              <label className={form.label} htmlFor="tplName">
                템플릿 이름
              </label>
              <input
                id="tplName"
                className={form.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="3T MRI 정기 PM"
              />
            </div>
            <div className={form.field}>
              <label className={form.label} htmlFor="tplMfr">
                제조사
              </label>
              <input
                id="tplMfr"
                className={form.input}
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </div>
          </div>
          <div className={form.field}>
            <label className={form.label} htmlFor="tplType">
              보전 유형
            </label>
            <select
              id="tplType"
              className={form.input}
              value={maintenanceType}
              onChange={(e) =>
                setMaintenanceType(e.target.value as MaintenanceScheduleType)
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
            <span className={form.label}>체크리스트</span>
            {items.map((item, idx) => (
              <div key={item.id} className={form.grid} style={{ marginTop: 8 }}>
                <input
                  className={form.input}
                  value={item.label}
                  placeholder="점검 항목"
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, label: e.target.value };
                    setItems(next);
                  }}
                />
                <button
                  type="button"
                  className={form.buttonSecondary}
                  onClick={() =>
                    setItems(items.filter((_, i) => i !== idx))
                  }
                >
                  제거
                </button>
              </div>
            ))}
            <button
              type="button"
              className={form.buttonSecondary}
              style={{ marginTop: 8 }}
              onClick={() => setItems([...items, EMPTY_ITEM()])}
            >
              항목 추가
            </button>
          </div>
          <div className={form.actions}>
            <button
              type="submit"
              className={form.buttonPrimary}
              disabled={submitting}
            >
              등록
            </button>
          </div>
        </form>
      )}

      <section className={l.section}>
        <h3 className={l.sectionTitle}>
          등록된 템플릿 {loading ? "" : `(${templates.length})`}
        </h3>
        <div className={l.tableWrap}>
          <table className={l.table}>
            <thead className={l.tableHead}>
              <tr>
                <th className={l.th}>이름</th>
                <th className={l.thHiddenMobile}>유형</th>
                <th className={l.th}>항목 수</th>
                <th className={l.th}>작업</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id} className={l.tr}>
                  <td className={l.td}>
                    <span className={l.tableLink}>{tpl.name}</span>
                    {tpl.manufacturer && (
                      <p className={l.tableSubtext}>{tpl.manufacturer}</p>
                    )}
                  </td>
                  <td className={l.tdHiddenMobile}>
                    {MAINTENANCE_TYPE_LABELS[tpl.maintenanceType]}
                  </td>
                  <td className={l.td}>{tpl.items.length}</td>
                  <td className={l.td}>
                    <div className={s.rowActions}>
                      {canManage && (
                        <>
                          <button
                            type="button"
                            className={s.smallBtn}
                            onClick={() => void handleAddItem(tpl)}
                          >
                            항목+
                          </button>
                          <button
                            type="button"
                            className={s.dangerBtn}
                            onClick={() => void handleDelete(tpl.id)}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
