import { EquipmentForm } from "@/components/EquipmentForm";
import * as l from "@/styles/layout.css";

export default function NewEquipmentPage() {
  return (
    <div className={l.pageContainer}>
      <header className={l.pageHeader}>
        <h2 className={l.pageTitle}>장비 등록</h2>
        <p className={l.pageSubtitle}>현재 병원 스코프에 새 장비를 추가합니다.</p>
      </header>
      <EquipmentForm mode="create" />
    </div>
  );
}
