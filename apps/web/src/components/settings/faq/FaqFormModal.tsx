"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { AdminFaqItem } from "@/lib/api/faqAdmin.api";
import * as btn from "../users/manageButtons.css";
import * as modal from "../users/inviteUserModal.css";

interface FaqFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  item?: AdminFaqItem | null;
  onClose: () => void;
  onSubmit: (payload: { question: string; answer: string }) => void;
  isSubmitting?: boolean;
}

function FaqFormModalBody({
  mode,
  item,
  onClose,
  onSubmit,
  isSubmitting,
}: Omit<FaqFormModalProps, "open">) {
  const [question, setQuestion] = useState(() =>
    mode === "edit" && item ? item.question : "",
  );
  const [answer, setAnswer] = useState(() =>
    mode === "edit" && item ? item.answer : "",
  );

  const isEdit = mode === "edit";
  const title = isEdit ? "FAQ 수정" : "FAQ 등록";
  const submitLabel = isSubmitting
    ? isEdit
      ? "수정 중…"
      : "등록 중…"
    : isEdit
      ? "수정하기"
      : "등록하기";

  const handleSubmit = () => {
    const q = question.trim();
    const a = answer.replaceAll("\r\n", "\n").trim();
    if (q.length < 2 || a.length < 2) return;
    onSubmit({ question: q, answer: a });
  };

  return (
    <div
      className={modal.faqModalOverlay}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={modal.faqModalCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby="faq-form-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2 id="faq-form-title" className={modal.modalTitle}>
          {title}
        </h2>
        <div className={modal.modalField}>
          <label className={modal.modalLabel} htmlFor="faq-question">
            질문
          </label>
          <input
            id="faq-question"
            className={modal.modalInput}
            placeholder="질문을 입력해 주세요"
            maxLength={200}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div className={modal.modalField}>
          <label className={modal.modalLabel} htmlFor="faq-answer">
            답변
          </label>
          <textarea
            id="faq-answer"
            className={modal.faqAnswerTextarea}
            placeholder="답변을 입력해 주세요"
            maxLength={4000}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>
        <div className={modal.faqModalFooter}>
          <button type="button" className={btn.btnCreamOutline} onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className={btn.btnNavy}
            disabled={
              isSubmitting ||
              question.trim().length < 2 ||
              answer.trim().length < 2
            }
            onClick={handleSubmit}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FaqFormModal({
  open,
  mode,
  item,
  onClose,
  onSubmit,
  isSubmitting,
}: FaqFormModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const formKey = `${mode}-${item?.id ?? "new"}`;

  return createPortal(
    <FaqFormModalBody
      key={formKey}
      mode={mode}
      item={item}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />,
    document.body,
  );
}
