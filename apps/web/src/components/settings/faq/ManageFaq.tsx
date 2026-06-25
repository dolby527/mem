"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAdminFaqItem,
  deleteAdminFaqItem,
  fetchAdminFaqItems,
  updateAdminFaqItem,
  type AdminFaqItem,
} from "@/lib/api/faqAdmin.api";
import { useAuth } from "@/providers/AuthProvider";
import * as pageStyles from "../users/managePage.css";
import { DeleteFaqModal } from "./DeleteFaqModal";
import { FaqFormModal } from "./FaqFormModal";
import { FaqRowMenu } from "./FaqRowMenu";
import * as faqStyles from "./manageFaq.css";

function ManageFaqInner() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<AdminFaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const [toastVariant, setToastVariant] = useState<"error" | "success">(
    "success",
  );
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<AdminFaqItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminFaqItem | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const showToast = useCallback(
    (text: string, variant: "error" | "success" = "success") => {
      setToastText(text);
      setToastVariant(variant);
      setToastOpen(true);
      globalThis.setTimeout(() => setToastOpen(false), 2800);
    },
    [],
  );

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminFaqItems();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== "HOSPITAL_ADMIN") {
      router.replace("/unauthorized");
      return;
    }
    if (user?.role === "HOSPITAL_ADMIN") {
      void loadItems();
    }
  }, [user, router, loadItems]);

  const openCreate = () => {
    setFormMode("create");
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (item: AdminFaqItem) => {
    setFormMode("edit");
    setEditTarget(item);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleFormSubmit = async (payload: {
    question: string;
    answer: string;
  }) => {
    setFormSubmitting(true);
    try {
      if (formMode === "edit" && editTarget) {
        await updateAdminFaqItem(editTarget.id, payload);
        showToast("FAQ가 수정되었습니다.");
      } else {
        await createAdminFaqItem(payload);
        showToast("FAQ가 등록되었습니다.");
      }
      closeForm();
      await loadItems();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "저장에 실패했습니다.",
        "error",
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await deleteAdminFaqItem(deleteTarget.id);
      setDeleteTarget(null);
      showToast("FAQ가 삭제되었습니다.");
      await loadItems();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "삭제에 실패했습니다.",
        "error",
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (user?.role !== "HOSPITAL_ADMIN") {
    return null;
  }

  const toastClass = [
    pageStyles.toast,
    toastOpen ? pageStyles.toastVisible : "",
    toastVariant === "error" ? pageStyles.toastError : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div role="alert" className={toastClass}>
        {toastText}
      </div>
      <FaqFormModal
        open={formOpen}
        mode={formMode}
        item={editTarget}
        onClose={closeForm}
        onSubmit={(payload) => void handleFormSubmit(payload)}
        isSubmitting={formSubmitting}
      />
      <DeleteFaqModal
        open={deleteTarget !== null}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirm()}
        isSubmitting={deleteSubmitting}
      />

      <div className={`${pageStyles.managePage} ${faqStyles.faqManagePage}`}>
        <div className={pageStyles.pageHead}>
          <h1 className={pageStyles.pageTitle}>FAQ 관리</h1>
          <div className={pageStyles.toolbarCluster}>
            <button
              type="button"
              className={faqStyles.registerBtn}
              onClick={openCreate}
            >
              FAQ 등록
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className={`${pageStyles.mutedBody} ${pageStyles.loadingTop}`}>
            불러오는 중…
          </p>
        ) : items.length === 0 ? (
          <div className={pageStyles.emptyWrap}>
            <div className={pageStyles.emptyArt} aria-hidden>
              ❓
            </div>
            <h2 className={pageStyles.emptyTitle}>등록된 FAQ가 없어요</h2>
            <p className={pageStyles.emptySub}>
              자주 묻는 질문과 답변을 등록해
              <br />
              구성원이 FAQ에서 바로 확인할 수 있게 해 주세요
            </p>
            <button
              type="button"
              className={faqStyles.registerBtn}
              onClick={openCreate}
            >
              FAQ 등록
            </button>
          </div>
        ) : (
          <div
            className={`${pageStyles.contentGrow} ${faqStyles.faqContentGrow}`}
          >
            <div className={faqStyles.faqTableHeader} role="row">
              <div role="columnheader">순서</div>
              <div role="columnheader">질문</div>
              <div role="columnheader">답변</div>
              <div role="columnheader">관리</div>
            </div>
            <div
              className={[
                faqStyles.faqListArea,
                items.length > faqStyles.FAQ_LIST_VISIBLE_ROWS
                  ? faqStyles.faqListAreaScrollable
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <ul
                className={[
                  faqStyles.faqRowList,
                  items.length > faqStyles.FAQ_LIST_VISIBLE_ROWS
                    ? faqStyles.faqRowListScrollable
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {items.map((item) => (
                  <li key={item.id} className={faqStyles.faqRowItem}>
                    <div className={faqStyles.faqRowInner}>
                      <span className={faqStyles.faqRowSort}>
                        {item.sortOrder}
                      </span>
                      <div className={faqStyles.faqRowTextCol}>
                        <p className={faqStyles.faqRowQuestion}>
                          {item.question}
                        </p>
                        <p className={faqStyles.faqRowAnswer}>{item.answer}</p>
                      </div>
                      <div className={faqStyles.faqRowActions}>
                        <FaqRowMenu
                          itemId={item.id}
                          openMenuId={openMenuId}
                          onToggle={(id) =>
                            setOpenMenuId((prev) =>
                              prev === id ? null : id,
                            )
                          }
                          onClose={() => setOpenMenuId(null)}
                          onEdit={() => openEdit(item)}
                          onDelete={() => setDeleteTarget(item)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function ManageFaq() {
  return (
    <Suspense
      fallback={<p className={pageStyles.mutedBody}>불러오는 중…</p>}
    >
      <ManageFaqInner />
    </Suspense>
  );
}
