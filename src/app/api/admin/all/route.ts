import { asc, count, eq } from "drizzle-orm";
import { db, t } from "@/db";
import { defaultContent } from "@/config/portfolio";
import { handler, ok } from "@/lib/api";
import { readFromDb } from "@/lib/content";

export const dynamic = "force-dynamic";

/** Uncached read for the admin UI (includes hidden items). */
export const GET = handler(async () => {
  let content = defaultContent;
  let seeded = true;
  try {
    content = await readFromDb();
  } catch (e) {
    if ((e as Error).message === "Database not seeded") seeded = false;
    else throw e;
  }
  const [unseen] = await db().select({ n: count() }).from(t.messages).where(eq(t.messages.seen, false));
  return ok({ content, seeded, unseen: unseen?.n ?? 0 });
});
