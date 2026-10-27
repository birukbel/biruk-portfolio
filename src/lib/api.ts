import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const ok = (data: unknown = { ok: true }) => NextResponse.json(data);
export const bad = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

/** Wrap handlers: zod errors -> 400, anything else -> 500 without leaking internals. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof ZodError) return bad(e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
      console.error("[api]", e);
      return bad("Server error", 500);
    }
  };
}
