import { cookieFetch } from "./cookie-fetch";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export function getFaqItems() {
  return cookieFetch<FaqItem[]>("/faq");
}
