/** Render private network hostport (`mem-api:10000`) or full URL. */
export function resolveApiInternalUrl(): string {
  const raw = process.env.API_INTERNAL_URL?.trim();
  if (!raw) {
    throw new Error("API_INTERNAL_URL is required for /mem-api proxy");
  }
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `http://${raw.replace(/\/$/, "")}`;
}
