/** mem-web → mem-api upstream (Render: mem-api RENDER_EXTERNAL_URL). */
export function resolveApiInternalUrl(): string {
  const raw = process.env.API_INTERNAL_URL?.trim();
  if (!raw) {
    if (process.env.NODE_ENV !== "production") {
      return "http://localhost:3001";
    }
    throw new Error(
      "API_INTERNAL_URL is not set on mem-web (set to mem-api public URL).",
    );
  }
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `http://${raw.replace(/\/$/, "")}`;
}
