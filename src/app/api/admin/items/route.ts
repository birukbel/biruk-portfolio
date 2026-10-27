import { max } from "drizzle-orm";
import { z } from "zod";
import { db, t } from "@/db";
import { handler, ok } from "@/lib/api";
import { ITEM_KINDS, itemSchema } from "@/lib/kinds";
import { refreshPublic } from "@/lib/revalidate";

const body = z.object({ kind: z.enum(ITEM_KINDS), data: z.record(z.string(), z.unknown()), visible: z.boolean().default(true) });

export const POST = handler(async (req: Request) => {
  const b = body.parse(await req.json());
  const data = itemSchema(b.kind).parse(b.data);
  const [m] = await db().select({ m: max(t.items.sortOrder) }).from(t.items);
  const [row] = await db()
    .insert(t.items)
    .values({ kind: b.kind, data, visible: b.visible, sortOrder: (m?.m ?? -1) + 1 })
    .returning({ id: t.items.id });
  refreshPublic();
  return ok({ id: row.id });
});
