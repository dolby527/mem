"use client";

import { useEffect, useMemo, useState } from "react";
import { getFaqItems, type FaqItem } from "@/lib/api/faq.api";
import * as styles from "./faqPage.css";

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FaqPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void getFaqItems()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "FAQ를 불러오지 못했습니다.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return items;
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(t) ||
        item.answer.toLowerCase().includes(t),
    );
  }, [items, query]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>FAQ</h1>
      <p className={styles.subtitleBold}>무엇을 도와드릴까요?</p>
      <p className={styles.subtitleMuted}>
        MEM 의료장비 관리 서비스 이용에 대한 자주 묻는 질문입니다.
      </p>

      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="검색어를 입력해 보세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="FAQ 검색"
          autoComplete="off"
        />
      </div>

      <hr className={styles.hr} />

      {isLoading ? <p className={styles.message}>불러오는 중…</p> : null}
      {error ? (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      ) : null}

      {!isLoading && !error && filtered.length === 0 ? (
        <p className={styles.empty}>검색 결과가 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((item) => {
            const expanded = openId[item.id];
            return (
              <li key={item.id} className={styles.itemRow}>
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() =>
                    setOpenId((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }))
                  }
                  aria-expanded={expanded}
                >
                  <span className={styles.questionText}>{item.question}</span>
                  <ChevronDown open={!!expanded} />
                </button>
                {expanded ? (
                  <p className={styles.answer}>{item.answer}</p>
                ) : null}
                <hr className={styles.itemHr} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
