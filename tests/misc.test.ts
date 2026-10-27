import { describe, expect, it, beforeAll } from "vitest";
import am from "../messages/am.json";
import en from "../messages/en.json";
import { toCsv, csvCell } from "@/lib/csv";
import { decide } from "@/lib/rate-limit";
import { hasPlaceholder, scrub } from "@/lib/placeholder";
import { parseBackup } from "@/lib/backup";
import { defaultContent } from "@/config/portfolio";
import { lookup } from "@/lib/messages";

describe("rate limit decision", () => {
  it("allows under the limit and blocks at it", () => {
    expect(decide(0, 5)).toEqual({ allowed: true, remaining: 5 });
    expect(decide(4, 5)).toEqual({ allowed: true, remaining: 1 });
    expect(decide(5, 5)).toEqual({ allowed: false, remaining: 0 });
    expect(decide(9, 5).allowed).toBe(false);
  });
});

describe("csv", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell('a,"b"\nc')).toBe('"a,""b""\nc"');
  });
  it("neutralises spreadsheet formulas", () => {
    for (const f of ["=SUM(A1)", "+1", "-2", "@cmd"]) expect(csvCell(f).startsWith(`"'`)).toBe(true);
  });
  it("builds rows in column order", () => {
    expect(toCsv([{ a: 1, b: "x" }], ["b", "a"])).toBe('"b","a"\r\n"x","1"');
  });
});

describe("placeholders", () => {
  it("detects and scrubs", () => {
    expect(hasPlaceholder("{{EMAIL}}")).toBe(true);
    expect(hasPlaceholder({ en: "ok", am: "{{X}}" })).toBe(true);
    expect(hasPlaceholder("real@mail.com")).toBe(false);
    expect(scrub("{{YEAR}}")).toBe("");
    expect(scrub("2024")).toBe("2024");
  });
});

describe("backup", () => {
  const good = () => ({
    version: 1 as const,
    profile: defaultContent.profile,
    flags: defaultContent.flags,
    theme: defaultContent.theme,
    items: defaultContent.items.map(({ kind, visible, sortOrder, data }) => ({ kind, visible, sortOrder, data })),
  });
  it("round-trips the default content", () => {
    expect(parseBackup(good()).items.length).toBe(defaultContent.items.length);
  });
  it("rejects an invalid item before anything is written", () => {
    const b = good();
    b.items[0] = { ...b.items[0], data: { ...b.items[0].data, title: { en: "x".repeat(999), am: "" } } };
    expect(() => parseBackup(b)).toThrow();
  });
  it("rejects a wrong version and unknown kinds", () => {
    expect(() => parseBackup({ ...good(), version: 2 })).toThrow();
    expect(() => parseBackup({ ...good(), items: [{ kind: "nope", visible: true, sortOrder: 0, data: {} }] })).toThrow();
  });
});

describe("translations", () => {
  const keys = (o: any, p = ""): string[] =>
    Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
  it("en and am have exactly the same keys", () => {
    expect(keys(am).sort()).toEqual(keys(en).sort());
  });
  it("no empty strings", () => {
    for (const k of keys(en)) {
      expect(lookup("en", k), k).not.toBe("");
      expect(lookup("am", k), k).not.toBe("");
    }
  });
  it("falls back to the path for unknown keys", () => {
    expect(lookup("en", "does.not.exist")).toBe("does.not.exist");
  });
});

describe("session", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-test-secret-test-secret";
  });
  it("signs and verifies, rejects tampering and garbage", async () => {
    const { signSession, verifySession } = await import("@/lib/session");
    const tok = await signSession();
    expect(await verifySession(tok)).toBe(true);
    expect(await verifySession(tok.slice(0, -2) + "xx")).toBe(false);
    expect(await verifySession("garbage")).toBe(false);
    expect(await verifySession(undefined)).toBe(false);
  });
  it("rejects tokens signed with another secret", async () => {
    const { signSession, verifySession } = await import("@/lib/session");
    const tok = await signSession();
    process.env.SESSION_SECRET = "another-secret-another-secret-123456";
    expect(await verifySession(tok)).toBe(false);
  });
});
