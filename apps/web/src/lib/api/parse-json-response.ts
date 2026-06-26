/** Never surfaces raw JSON.parse SyntaxError messages to the UI. */
export function parseJsonText<T>(text: string): T | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

export function parseJsonTextOrThrow<T>(
  text: string,
  fallbackMessage: string,
): T {
  const parsed = parseJsonText<T>(text);
  if (parsed != null) return parsed;
  throw new Error(fallbackMessage);
}
