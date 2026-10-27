import am from "@messages/am.json";
import en from "@messages/en.json";
import type { Lang } from "./kinds";

const dict = { am, en } as const;

/** Dot-path lookup with English fallback; returns the path itself if the key does not exist. */
export function lookup(lang: Lang, path: string): string {
  const get = (d: unknown) => path.split(".").reduce<any>((o, k) => o?.[k], d);
  const val = get(dict[lang]);
  if (typeof val === "string") return val;
  const fallback = get(dict.en);
  return typeof fallback === "string" ? fallback : path;
}
