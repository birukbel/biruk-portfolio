import { desc } from "drizzle-orm";
import { db, t } from "@/db";
import { handler, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const rows = await db().select().from(t.messages).orderBy(desc(t.messages.createdAt)).limit(500);
  return ok({ messages: rows });
});
