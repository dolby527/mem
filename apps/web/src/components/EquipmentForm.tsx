"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  createEquipment,
  updateEquipment,
  type CreateEquipmentPayload,
} from "@/lib/api/equipment.api";
import { equipmentDetailPath, MONITORING_BASE } from "@/lib/navigation/paths";
import {
  FALLBACK_SOURCE_TYPES,
  PRIMARY_SOURCE_TYPES,
  STATUS_SOURCE_LABELS,
  VENDOR_INTERFACE_LABELS,
} from "@/lib/status-source";
import { MAINTENANCE_LABELS } from "@/lib/maintenance";
import type {
  EquipmentCategory,
  EquipmentStatus,
  MaintenanceStatus,
  StatusSourceType,
  VendorInterfaceType,
} from "@/lib/types";
import * as s from "./EquipmentForm.css";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const CATEGORIES: EquipmentCategory[] = [
  "MRI",
  "CT",
  "ULTRASOUND",
  "VENTILATOR",
  "MAMMOGRAPHY",
  "MONITOR",
  "OTHER",
];

const STATUSES: EquipmentStatus[] = ["RUNNING", "IDLE", "FAULT", "OFFLINE"];
const MAINTENANCE_STATUSES: MaintenanceStatus[] = ["NONE", "PM_SCHEDULED"];

const VENDOR_TYPES: VendorInterfaceType[] = [
  "PATIENT_MONITOR",
  "EKG",
  "OUTPATIENT",
  "LIS",
  "OTHER",
];

export interface EquipmentFormValues {
  equipmentSlug: string;
  name: string;
  category: EquipmentCategory;
  location: string;
  spatialBuilding: string;
  spatialFloor: string;
  spatialRoom: string;
  manufacturer: string;
  model: string;
  manufacturedAt: string;
  statusSourceType: StatusSourceType;
  fallbackSourceType: string;
  vendorDeviceId: string;
  vendorInterfaceType: VendorInterfaceType | "";
  statusSourceTypeReason: string;
  currentStatus: EquipmentStatus;
  maintenanceStatus: MaintenanceStatus;
  pmScheduledAt: string;
  devProbeHost: string;
  iotIdleThresholdW: string;
  iotRunningThresholdW: string;
  notes: string;
  existingImageUrl?: string;
  imageAlt: string;
}

const EMPTY: EquipmentFormValues = {
  equipmentSlug: "",
  name: "",
  category: "OTHER",
  location: "",
  spatialBuilding: "",
  spatialFloor: "",
  spatialRoom: "",
  manufacturer: "",
  model: "",
  manufacturedAt: "",
  statusSourceType: "PING",
  fallbackSourceType: "",
  vendorDeviceId: "",
  vendorInterfaceType: "",
  statusSourceTypeReason: "MVP: 네트워크 연결 여부만 확인.",
  currentStatus: "IDLE",
  maintenanceStatus: "NONE",
  pmScheduledAt: "",
  devProbeHost: "",
  iotIdleThresholdW: "5",
  iotRunningThresholdW: "50",
  notes: "",
  imageAlt: "",
};

interface EquipmentFormProps {
  mode: "create" | "edit";
  initial?: Partial<EquipmentFormValues>;
  equipmentSlug?: string;
}

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className={s.label}>
      {children}
      {required ? (
        <>
          {" "}
          <span className={s.requiredMark} aria-hidden="true">
            *
          </span>
          <span className={s.srOnly}> (필수)</span>
        </>
      ) : null}
    </span>
  );
}

function validateForm(
  values: EquipmentFormValues,
  mode: "create" | "edit",
  imageFile: File | null,
): string | null {
  if (!values.name.trim()) return "장비명을 입력하세요.";
  if (mode === "create" && !values.equipmentSlug.trim()) {
    return "장비 ID를 입력하세요.";
  }
  const hasLocation =
    values.location.trim() ||
    values.spatialBuilding.trim() ||
    values.spatialFloor.trim() ||
    values.spatialRoom.trim();
  if (!hasLocation) {
    return "위치 정보(원문·건물·층·부서 중 하나 이상)를 입력하세요.";
  }
  if (
    values.statusSourceType === "INTERFACE_VENDOR" &&
    !values.vendorDeviceId.trim()
  ) {
    return "INTERFACE_VENDOR 장비는 벤더 장비 ID가 필요합니다.";
  }
  if (mode === "create" && !imageFile) {
    return "장비 이미지를 선택하세요.";
  }
  if (imageFile && imageFile.size > MAX_IMAGE_BYTES) {
    return "이미지는 5MB 이하여야 합니다.";
  }
  return null;
}

function toPayload(values: EquipmentFormValues): CreateEquipmentPayload {
  const trim = (v: string) => v.trim() || undefined;
  const fallback = values.fallbackSourceType.trim() as StatusSourceType | "";
  return {
    equipmentSlug: values.equipmentSlug.trim(),
    name: values.name.trim(),
    category: values.category,
    location: trim(values.location),
    spatialBuilding: trim(values.spatialBuilding),
    spatialFloor: trim(values.spatialFloor),
    spatialRoom: trim(values.spatialRoom),
    manufacturer: trim(values.manufacturer),
    model: trim(values.model),
    manufacturedAt: values.manufacturedAt
      ? new Date(values.manufacturedAt).toISOString()
      : null,
    statusSourceType: values.statusSourceType,
    fallbackSourceType: fallback || undefined,
    statusSourceTypeReason: trim(values.statusSourceTypeReason),
    vendorDeviceId: trim(values.vendorDeviceId),
    vendorInterfaceType: values.vendorInterfaceType || undefined,
    currentStatus: values.currentStatus,
    maintenanceStatus: values.maintenanceStatus,
    pmScheduledAt:
      values.maintenanceStatus === "PM_SCHEDULED" && values.pmScheduledAt
        ? new Date(values.pmScheduledAt).toISOString()
        : values.maintenanceStatus === "NONE"
          ? null
          : undefined,
    devProbeHost: trim(values.devProbeHost),
    iotIdleThresholdW: values.iotIdleThresholdW
      ? Number(values.iotIdleThresholdW)
      : undefined,
    iotRunningThresholdW: values.iotRunningThresholdW
      ? Number(values.iotRunningThresholdW)
      : undefined,
    imageAlt: trim(values.imageAlt) || trim(values.name),
    notes: trim(values.notes),
  };
}

export function EquipmentForm({ mode, initial, equipmentSlug }: EquipmentFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<EquipmentFormValues>({
    ...EMPTY,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [agentTokenPlain, setAgentTokenPlain] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initial?.existingImageUrl ?? null,
  );

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const previewAlt = useMemo(
    () => values.imageAlt.trim() || values.name.trim() || "장비 이미지",
    [values.imageAlt, values.name],
  );

  const showVendor =
    values.statusSourceType === "INTERFACE_VENDOR" ||
    values.statusSourceType === "MEDICAL_PROTOCOL";
  const showPing =
    values.statusSourceType === "PING" ||
    values.fallbackSourceType === "PING";
  const showIot =
    values.statusSourceType === "IOT_SENSOR" ||
    values.fallbackSourceType === "IOT_SENSOR";

  function set<K extends keyof EquipmentFormValues>(key: K, value: EquipmentFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validateForm(values, mode, imageFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    setPending(true);
    try {
      const payload = toPayload(values);
      if (mode === "create") {
        const created = await createEquipment(payload, imageFile);
        if (created.agentTokenPlain) {
          setAgentTokenPlain(created.agentTokenPlain);
        }
        router.push(equipmentDetailPath(created.equipmentSlug));
      } else if (equipmentSlug) {
        const update = { ...payload };
        delete (update as Partial<CreateEquipmentPayload>).equipmentSlug;
        await updateEquipment(equipmentSlug, update, imageFile);
        router.push(equipmentDetailPath(equipmentSlug));
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={s.form} onSubmit={onSubmit}>
      <p className={s.requiredLegend}>
        <span className={s.requiredMark} aria-hidden="true">
          *
        </span>{" "}
        필수 입력
      </p>
      <div className={s.formLayout}>
        <aside className={s.imageAside}>
          <FieldLabel required={mode === "create"}>장비 이미지</FieldLabel>
          {imagePreviewUrl ? (
            <Image
              src={imagePreviewUrl}
              alt={previewAlt}
              width={320}
              height={240}
              className={s.imagePreview}
              unoptimized
            />
          ) : (
            <div className={s.imagePreview} aria-hidden />
          )}
          <input
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
              if (!file) {
                setImagePreviewUrl(values.existingImageUrl ?? null);
              }
            }}
          />
          <p className={s.imageHint}>JPEG, PNG, WebP · 최대 5MB</p>
          <label className={s.field}>
            <FieldLabel>이미지 대체 텍스트</FieldLabel>
            <input
              className={s.input}
              value={values.imageAlt}
              onChange={(e) => set("imageAlt", e.target.value)}
              placeholder={values.name || "장비명과 동일하게 사용"}
            />
          </label>
        </aside>
        <div className={s.grid}>
        {mode === "create" && (
          <label className={s.field}>
            <FieldLabel required>장비 ID (slug)</FieldLabel>
            <input
              className={s.input}
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={values.equipmentSlug}
              onChange={(e) => set("equipmentSlug", e.target.value)}
              placeholder="asan-ge-ct-01"
            />
          </label>
        )}
        <label className={s.field}>
          <FieldLabel required>장비명</FieldLabel>
          <input
            className={s.input}
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>
        <label className={s.field}>
          <FieldLabel required>분류</FieldLabel>
          <select
            className={s.input}
            value={values.category}
            onChange={(e) => set("category", e.target.value as EquipmentCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className={s.locationSection}>
          <div className={s.locationGroup}>
            <FieldLabel required>위치 정보</FieldLabel>
            <p className={s.locationGroupHint}>
              원문·건물·층·부서 중 하나 이상 입력
            </p>
          </div>
          <label className={s.field}>
            <FieldLabel>위치 (원문)</FieldLabel>
            <input
              className={s.input}
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </label>
          <label className={s.field}>
            <FieldLabel>건물/동</FieldLabel>
            <input
              className={s.input}
              value={values.spatialBuilding}
              onChange={(e) => set("spatialBuilding", e.target.value)}
              placeholder="본관"
            />
          </label>
          <label className={s.field}>
            <FieldLabel>층/구역</FieldLabel>
            <input
              className={s.input}
              value={values.spatialFloor}
              onChange={(e) => set("spatialFloor", e.target.value)}
              placeholder="3층"
            />
          </label>
          <label className={s.field}>
            <FieldLabel>부서/실</FieldLabel>
            <input
              className={s.input}
              value={values.spatialRoom}
              onChange={(e) => set("spatialRoom", e.target.value)}
              placeholder="핵의학과 PET 검사실"
            />
          </label>
        </div>
        <label className={s.field}>
          <FieldLabel>제조사</FieldLabel>
          <input
            className={s.input}
            value={values.manufacturer}
            onChange={(e) => set("manufacturer", e.target.value)}
          />
        </label>
        <label className={s.field}>
          <FieldLabel>모델</FieldLabel>
          <input
            className={s.input}
            value={values.model}
            onChange={(e) => set("model", e.target.value)}
          />
        </label>
        <label className={s.field}>
          <FieldLabel>제조연월일</FieldLabel>
          <input
            className={s.input}
            type="date"
            value={values.manufacturedAt}
            onChange={(e) => set("manufacturedAt", e.target.value)}
          />
        </label>
        <label className={s.field}>
          <FieldLabel required>Primary 상태 소스</FieldLabel>
          <select
            className={s.input}
            value={values.statusSourceType}
            onChange={(e) =>
              set("statusSourceType", e.target.value as StatusSourceType)
            }
          >
            {PRIMARY_SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {STATUS_SOURCE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className={s.field}>
          <FieldLabel>Fallback 소스</FieldLabel>
          <select
            className={s.input}
            value={values.fallbackSourceType}
            onChange={(e) => set("fallbackSourceType", e.target.value)}
          >
            <option value="">없음</option>
            {FALLBACK_SOURCE_TYPES.filter(
              (t) => t !== values.statusSourceType,
            ).map((t) => (
              <option key={t} value={t}>
                {STATUS_SOURCE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        {showVendor && (
          <>
            <label className={s.field}>
              <FieldLabel
                required={values.statusSourceType === "INTERFACE_VENDOR"}
              >
                벤더 장비 ID
              </FieldLabel>
              <input
                className={s.input}
                required={values.statusSourceType === "INTERFACE_VENDOR"}
                value={values.vendorDeviceId}
                onChange={(e) => set("vendorDeviceId", e.target.value)}
                placeholder="ICU-VENT-01"
              />
            </label>
            <label className={s.field}>
              <FieldLabel>인터페이스 유형</FieldLabel>
              <select
                className={s.input}
                value={values.vendorInterfaceType}
                onChange={(e) =>
                  set(
                    "vendorInterfaceType",
                    e.target.value as VendorInterfaceType | "",
                  )
                }
              >
                <option value="">선택</option>
                {VENDOR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {VENDOR_INTERFACE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <label className={s.field}>
          <FieldLabel>현재 상태</FieldLabel>
          <select
            className={s.input}
            value={values.currentStatus}
            onChange={(e) => set("currentStatus", e.target.value as EquipmentStatus)}
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </label>
        <label className={s.field}>
          <FieldLabel>보전 상태</FieldLabel>
          <select
            className={s.input}
            value={values.maintenanceStatus}
            onChange={(e) =>
              set("maintenanceStatus", e.target.value as MaintenanceStatus)
            }
          >
            {MAINTENANCE_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === "NONE" ? "없음" : MAINTENANCE_LABELS[st]}
              </option>
            ))}
          </select>
        </label>
        {values.maintenanceStatus === "PM_SCHEDULED" && (
          <label className={s.field}>
            <FieldLabel>PM 예정 일시</FieldLabel>
            <input
              className={s.input}
              type="datetime-local"
              value={values.pmScheduledAt}
              onChange={(e) => set("pmScheduledAt", e.target.value)}
            />
          </label>
        )}
        {showPing && (
          <label className={s.field}>
            <FieldLabel>Probe 호스트 (PING)</FieldLabel>
            <input
              className={s.input}
              value={values.devProbeHost}
              onChange={(e) => set("devProbeHost", e.target.value)}
              placeholder="192.168.1.10"
            />
          </label>
        )}
        {showIot && (
          <>
            <label className={s.field}>
              <FieldLabel>IoT 대기 임계치 (W)</FieldLabel>
              <input
                className={s.input}
                type="number"
                min={0}
                value={values.iotIdleThresholdW}
                onChange={(e) => set("iotIdleThresholdW", e.target.value)}
              />
            </label>
            <label className={s.field}>
              <FieldLabel>IoT 가동 임계치 (W)</FieldLabel>
              <input
                className={s.input}
                type="number"
                min={0}
                value={values.iotRunningThresholdW}
                onChange={(e) => set("iotRunningThresholdW", e.target.value)}
              />
            </label>
          </>
        )}
        <div className={s.notesGrid}>
          <label className={s.field}>
            <FieldLabel>상태 판별 설명</FieldLabel>
            <textarea
              className={s.textarea}
              value={values.statusSourceTypeReason}
              onChange={(e) => set("statusSourceTypeReason", e.target.value)}
            />
          </label>
          <label className={s.field}>
            <FieldLabel>비고</FieldLabel>
            <textarea
              className={s.textarea}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </label>
        </div>
        </div>
      </div>
      {agentTokenPlain && (
        <p className={s.note}>
          에이전트 토큰 (1회만 표시): <code>{agentTokenPlain}</code>
        </p>
      )}
      {error && <p className={s.error}>{error}</p>}
      <div className={s.actions}>
        <Link href={MONITORING_BASE} className={s.buttonSecondary}>
          취소
        </Link>
        <button type="submit" className={s.buttonPrimary} disabled={pending}>
          {pending ? "저장 중…" : mode === "create" ? "등록" : "수정 저장"}
        </button>
      </div>
    </form>
  );
}
