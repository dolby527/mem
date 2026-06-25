import Link from "next/link";
import { statusChip } from "@/styles/status.css";
import * as s from "./landing.css";

const FEATURES = [
  {
    icon: "🏥",
    title: "병원별 장비 마스터",
    desc: "MRI·CT·인공호흡기 등 의료장비를 병원 단위로 등록·관리합니다.",
  },
  {
    icon: "📡",
    title: "주기 헬스체크",
    desc: "PING·AGENT·IOT 등 하이브리드 소스로 장비 상태를 주기적으로 점검합니다.",
  },
  {
    icon: "⚡",
    title: "실시간 모니터링",
    desc: "SSE로 RUNNING·IDLE·FAULT·OFFLINE 상태 변화를 대시보드에 즉시 반영합니다.",
  },
] as const;

export function LandingContent() {
  return (
    <div className={s.page}>
      <div className={s.inner}>
        <section className={s.hero} aria-label="소개">
          <p className={s.eyebrow}>Medical Equipment Management</p>
          <h1 className={s.title}>
            병원 의료장비 통합 관리와
            <br />
            실시간 운영 모니터링
          </h1>
          <p className={s.subtitle}>
            MEM은 병원별 의료장비 마스터 데이터, 주기적 헬스체크, 실시간 상태
            대시보드를 하나의 플랫폼에서 제공합니다.
          </p>

          <div className={s.mobileCtas}>
            <Link href="/login" className={s.ctaPrimary}>
              로그인
            </Link>
            <Link href="/signup/hospital-admin" className={s.ctaSecondary}>
              병원 관리자 가입
            </Link>
          </div>
        </section>

        <section className={s.featureGrid} aria-label="주요 기능">
          {FEATURES.map((f) => (
            <article key={f.title} className={s.featureCard}>
              <p className={s.featureIcon}>{f.icon}</p>
              <h2 className={s.featureTitle}>{f.title}</h2>
              <p className={s.featureDesc}>{f.desc}</p>
            </article>
          ))}
        </section>

        <section className={s.statusSection} aria-label="장비 상태">
          <h2 className={s.statusTitle}>4가지 운영 상태를 한눈에</h2>
          <div className={s.statusRow}>
            <span className={statusChip({ status: "RUNNING" })}>가동 중</span>
            <span className={statusChip({ status: "IDLE" })}>대기</span>
            <span className={statusChip({ status: "FAULT" })}>장애</span>
            <span className={statusChip({ status: "OFFLINE" })}>오프라인</span>
          </div>
        </section>
      </div>
    </div>
  );
}
