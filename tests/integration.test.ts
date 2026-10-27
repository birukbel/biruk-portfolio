/**
 * Integration tests: the real route handlers and queries run against an in-process Postgres (PGlite)
 * using the generated SQL migration, so schema + queries are exercised without a network database.
 * Only `db.batch` is emulated sequentially (neon-http runs it as one transaction in production).
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: (fn: any) => fn,
}));

vi.mock("@/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const schema = await import("../src/db/schema");
  const fs = await import("node:fs");
  const client = new PGlite();
  for (const stmt of fs.readFileSync("drizzle/0000_init.sql", "utf8").split("--> statement-breakpoint")) {
    await client.exec(stmt);
  }
  const d = drizzle(client, { schema });
  const wrapped = Object.assign(d, {
    batch: async (ops: any[]) => {
      const out = [];
      for (const o of ops) out.push(await o);
      return out;
    },
  });
  return { db: () => wrapped, hasDb: () => true, t: schema };
});

import { db, t } from "@/db";
import { defaultContent } from "@/config/portfolio";
import { readFromDb } from "@/lib/content";
import { seed } from "@/lib/seed";

const json = (body: unknown, headers: Record<string, string> = {}) => ({
  method: "POST",
  headers: { "content-type": "application/json", ...headers },
  body: JSON.stringify(body),
});
const req = (url: string, init?: RequestInit) => new Request(`http://localhost${url}`, init);
const ctx = (id: number | string) => ({ params: Promise.resolve({ id: String(id) }) });

beforeAll(() => {
  process.env.ADMIN_PASSWORD = "correct horse battery";
  process.env.SESSION_SECRET = "integration-secret-integration-secret";
});

beforeEach(async () => {
  const d = db();
  await d.delete(t.items);
  await d.delete(t.siteSettings);
  await d.delete(t.messages);
  await d.delete(t.rateLimitHits);
  await d.delete(t.loginAttempts);
});

describe("seed + read", () => {
  it("fails to read before seeding, then round-trips the defaults", async () => {
    await expect(readFromDb()).rejects.toThrow("not seeded");
    const r = await seed();
    expect(r.items).toBe(defaultContent.items.length);
    const c = await readFromDb();
    expect(c.profile.name.en).toBe("Biruk Belete");
    expect(c.items.length).toBe(defaultContent.items.length);
  });

  it("is idempotent and never overwrites edited settings", async () => {
    await seed();
    await db()
      .update(t.siteSettings)
      .set({ value: { ...defaultContent.profile, headline: { en: "Edited", am: "ተስተካክሏል" } } });
    const again = await seed();
    expect(again.items).toBe(0);
    const c = await readFromDb();
    expect(c.profile.headline.en).toBe("Edited");
    expect(c.items.length).toBe(defaultContent.items.length);
  });

  it("falls back to default settings if a stored value is corrupt", async () => {
    await seed();
    await db().update(t.siteSettings).set({ value: { nonsense: true } });
    const c = await readFromDb();
    expect(c.theme).toEqual(defaultContent.theme);
  });
});

describe("items API", () => {
  it("creates, updates, reorders and deletes", async () => {
    const items = await import("@/app/api/admin/items/route");
    const one = await import("@/app/api/admin/items/[id]/route");
    const reorder = await import("@/app/api/admin/items/reorder/route");
    await seed();

    const data = { title: { en: "New", am: "አዲስ" }, summary: { en: "s", am: "ሰ" }, icon: "code" };
    const created = await items.POST(req("/api/admin/items", json({ kind: "service", data })));
    expect(created.status).toBe(200);
    const { id } = await created.json();

    const upd = await one.PUT(req(`/api/admin/items/${id}`, { ...json({ data: { ...data, title: { en: "Renamed", am: "አዲስ" } }, visible: false }), method: "PUT" }), ctx(id));
    expect(upd.status).toBe(200);
    const c = await readFromDb();
    const row = c.items.find((i) => i.id === id)!;
    expect(row.data.title.en).toBe("Renamed");
    expect(row.visible).toBe(false);

    const services = c.items.filter((i) => i.kind === "service").map((i) => Number(i.id));
    const flipped = [...services].reverse();
    const re = await reorder.POST(req("/api/admin/items/reorder", json({ ids: flipped })));
    expect(re.status).toBe(200);
    const after = (await readFromDb()).items.filter((i) => i.kind === "service").map((i) => Number(i.id));
    expect(after).toEqual(flipped);

    const del = await one.DELETE(req(`/api/admin/items/${id}`, { method: "DELETE" }), ctx(id));
    expect(del.status).toBe(200);
    expect((await readFromDb()).items.find((i) => i.id === id)).toBeUndefined();
  });

  it("rejects unsafe URLs and unknown kinds with 400", async () => {
    const items = await import("@/app/api/admin/items/route");
    const bad = await items.POST(req("/x", json({ kind: "project", data: { title: { en: "a", am: "b" }, summary: { en: "a", am: "b" }, tags: [], url: "javascript:alert(1)" } })));
    expect(bad.status).toBe(400);
    const unknown = await items.POST(req("/x", json({ kind: "hacker", data: {} })));
    expect(unknown.status).toBe(400);
  });

  it("returns 404 when updating a missing item", async () => {
    const one = await import("@/app/api/admin/items/[id]/route");
    const r = await one.PUT(req("/x", { ...json({ visible: false }), method: "PUT" }), ctx(99999));
    expect(r.status).toBe(404);
  });
});

describe("settings API", () => {
  it("saves valid settings and rejects a bad colour", async () => {
    const s = await import("@/app/api/admin/settings/route");
    await seed();
    const ok = await s.PUT(req("/x", { ...json({ theme: { accent: "#112233", accent2: "#aabbcc" } }), method: "PUT" }));
    expect(ok.status).toBe(200);
    expect((await readFromDb()).theme.accent).toBe("#112233");
    const bad = await s.PUT(req("/x", { ...json({ theme: { accent: "red", accent2: "#aabbcc" } }), method: "PUT" }));
    expect(bad.status).toBe(400);
    expect((await readFromDb()).theme.accent).toBe("#112233");
  });
});

describe("backup export / import", () => {
  it("exports then re-imports the same content", async () => {
    const exp = await import("@/app/api/admin/export/route");
    const imp = await import("@/app/api/admin/import/route");
    await seed();
    const file = await (await exp.GET()).json();
    expect(file.version).toBe(1);
    expect(file.items.length).toBe(defaultContent.items.length);

    file.items = file.items.slice(0, 3);
    const r = await imp.POST(req("/x", json(file)));
    expect(r.status).toBe(200);
    expect((await readFromDb()).items.length).toBe(3);
  });

  it("an invalid file changes nothing", async () => {
    const imp = await import("@/app/api/admin/import/route");
    await seed();
    const before = (await readFromDb()).items.length;
    const r = await imp.POST(req("/x", json({ version: 1, profile: {}, flags: {}, theme: {}, items: [] })));
    expect(r.status).toBe(400);
    expect((await readFromDb()).items.length).toBe(before);
  });
});

describe("contact API", () => {
  const msg = { name: "Hana", email: "hana@example.com", body: "Hello Biruk, can we talk?" };

  it("stores a valid message", async () => {
    const c = await import("@/app/api/contact/route");
    await seed();
    const r = await c.POST(req("/x", json(msg, { "x-forwarded-for": "1.1.1.1" })));
    expect(r.status).toBe(200);
    const rows = await db().select().from(t.messages);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("hana@example.com");
  });

  it("silently drops honeypot submissions", async () => {
    const c = await import("@/app/api/contact/route");
    const r = await c.POST(req("/x", json({ ...msg, website: "http://spam" }, { "x-forwarded-for": "2.2.2.2" })));
    expect(r.status).toBe(200);
    expect(await db().select().from(t.messages)).toHaveLength(0);
  });

  it("rate-limits to 3 messages per hour per IP, other IPs unaffected", async () => {
    const c = await import("@/app/api/contact/route");
    await seed();
    const h = { "x-forwarded-for": "3.3.3.3" };
    for (let i = 0; i < 3; i++) expect((await c.POST(req("/x", json(msg, h)))).status).toBe(200);
    expect((await c.POST(req("/x", json(msg, h)))).status).toBe(429);
    expect((await c.POST(req("/x", json(msg, { "x-forwarded-for": "4.4.4.4" })))).status).toBe(200);
    expect(await db().select().from(t.messages)).toHaveLength(4);
  });

  it("respects the contactOpen flag", async () => {
    const c = await import("@/app/api/contact/route");
    await seed();
    await db().update(t.siteSettings).set({ value: { ...defaultContent.flags, contactOpen: false } }).where((await import("drizzle-orm")).eq(t.siteSettings.key, "flags"));
    expect((await c.POST(req("/x", json(msg, { "x-forwarded-for": "5.5.5.5" })))).status).toBe(403);
  });

  it("validates input", async () => {
    const c = await import("@/app/api/contact/route");
    expect((await c.POST(req("/x", json({ name: "", email: "nope", body: "x" })))).status).toBe(400);
  });
});

describe("login", () => {
  const login = async (password: string, ip: string) => {
    const l = await import("@/app/api/admin/login/route");
    return l.POST(req("/x", json({ password }, { "x-forwarded-for": ip })));
  };

  it("sets an httpOnly, SameSite=Lax session cookie on success", async () => {
    const r = await login("correct horse battery", "9.9.9.1");
    expect(r.status).toBe(200);
    const cookie = r.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/admin_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
    expect(cookie).not.toMatch(/Secure/i); // NODE_ENV is "test": plain http works locally
  });

  it("rejects a wrong password and locks the IP after 5 failures, even for the right password", async () => {
    for (let i = 0; i < 5; i++) expect((await login("wrong", "9.9.9.2")).status).toBe(401);
    expect((await login("correct horse battery", "9.9.9.2")).status).toBe(429);
    expect((await login("correct horse battery", "9.9.9.3")).status).toBe(200);
  });
});

describe("messages API", () => {
  it("lists, marks seen, exports CSV safely and deletes", async () => {
    const list = await import("@/app/api/admin/messages/route");
    const one = await import("@/app/api/admin/messages/[id]/route");
    const csv = await import("@/app/api/admin/messages/export/route");
    const [m] = await db().insert(t.messages).values({ name: "=HYPERLINK(\"x\")", email: "a@b.co", body: "hi, \"there\"" }).returning();

    const got = await (await list.GET()).json();
    expect(got.messages).toHaveLength(1);

    expect((await one.PATCH(req("/x", { ...json({ seen: true }), method: "PATCH" }), ctx(m.id))).status).toBe(200);
    expect((await db().select().from(t.messages))[0].seen).toBe(true);

    const text = await (await csv.GET()).text();
    expect(text).toContain(`"'=HYPERLINK`);
    expect(text).toContain('"hi, ""there"""');

    expect((await one.DELETE(req("/x", { method: "DELETE" }), ctx(m.id))).status).toBe(200);
    expect(await db().select().from(t.messages)).toHaveLength(0);
  });
});
