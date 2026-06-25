import { cookieFetch } from "./cookie-fetch";

export interface AdminFaqItem {
  id: string;
  sortOrder: number;
  question: string;
  answer: string;
  isPublished: boolean;
}

export interface CreateAdminFaqBody {
  question: string;
  answer: string;
  sortOrder?: number;
}

export interface UpdateAdminFaqBody {
  question: string;
  answer: string;
}

export function fetchAdminFaqItems() {
  return cookieFetch<AdminFaqItem[]>("/admin/faq");
}

export function createAdminFaqItem(body: CreateAdminFaqBody) {
  return cookieFetch<AdminFaqItem>("/admin/faq", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminFaqItem(id: string, body: UpdateAdminFaqBody) {
  return cookieFetch<AdminFaqItem>(`/admin/faq/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAdminFaqItem(id: string) {
  return cookieFetch<void>(`/admin/faq/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
