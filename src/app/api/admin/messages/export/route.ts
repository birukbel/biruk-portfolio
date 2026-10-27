import { desc } from "drizzle-orm";
import { db, t } from "@/db";
import { handler } from "@/lib/api";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const rows = await db().select().from(t.messages).orderBy(desc(t.messages.createdAt));
  const csv = toCsv(
    rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    ["id", "createdAt", "name", "email", "body", "seen"],
  );
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="messages.csv"',
    },
  });
});
