const PLACEHOLDER = /\{\{[^}]*\}\}/;

/** True if any string inside v (deeply) still contains a "{{PLACEHOLDER}}". Client-safe (no server imports). */
export function hasPlaceholder(v: unknown): boolean {
  if (typeof v === "string") return PLACEHOLDER.test(v);
  if (v && typeof v === "object") return Object.values(v as object).some(hasPlaceholder);
  return false;
}

/** Blank out text that is still a placeholder so visitors never see "{{...}}". */
export function scrub(v: string): string {
  return PLACEHOLDER.test(v) ? "" : v;
}

/**
 * Deep-clean for the public page: a line containing a placeholder is dropped (multi-line text keeps
 * its other lines), so "{{...}}" never reaches the HTML or the RSC payload.
 */
export function stripPlaceholders<T>(v: T): T {
  if (typeof v === "string") {
    if (!PLACEHOLDER.test(v)) return v;
    return v.split(/\r?\n/).filter((l) => !PLACEHOLDER.test(l)).join("\n") as T;
  }
  if (Array.isArray(v)) return v.map(stripPlaceholders) as T;
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, stripPlaceholders(x)])) as T;
  }
  return v;
}
