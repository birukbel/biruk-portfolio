import { count } from "drizzle-orm";
import { db, t } from "@/db";
import { defaultFlags, defaultProfile, defaultSeeds, defaultTheme } from "@/config/portfolio";

/** Idempotent: never overwrites settings and only inserts items into an empty table. */
export async function seed() {
  const d = db();
  await d.insert(t.siteSettings).values({ key: "profile", value: defaultProfile }).onConflictDoNothing();
  await d.insert(t.siteSettings).values({ key: "flags", value: defaultFlags }).onConflictDoNothing();
  await d.insert(t.siteSettings).values({ key: "theme", value: defaultTheme }).onConflictDoNothing();

  const [{ n }] = await d.select({ n: count() }).from(t.items);
  if (n === 0) {
    await d.insert(t.items).values(
      defaultSeeds.map((s, i) => ({ kind: s.kind, data: s.data, sortOrder: i, visible: true })),
    );
    return { items: defaultSeeds.length };
  }
  return { items: 0 };
}
