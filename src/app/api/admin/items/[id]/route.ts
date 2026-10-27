import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, t } from "@/db";
import { bad, handler, ok } from "@/lib/api";
import { ITEM_KINDS, itemSchema, type ItemKind } from "@/lib/kinds";
import { refreshPublic } from "@/lib/revalidate";

type Ctx = { params: Promise<{ id: string }> };
const idOf = async (c: Ctx) => z.coerce.number().int().positive().parse((await c.params).id);

export const PUT = handler(async (req: Request, ctx: Ctx) => {
  const id = await idOf(ctx);
  const b = z
    .object({ data: z.record(z.string(), z.unknown()).optional(), visible: z.boolean().optional() })
    .parse(await req.json());
  const [row] = await db().select().from(t.items).where(eq(t.items.id, id));
  if (!row || !(ITEM_KINDS as readonly string[]).includes(row.kind)) return bad("Not found", 404);

  const patch: { data?: unknown; visible?: boolean } = {};
  if (b.data) patch.data = itemSchema(row.kind as ItemKind).parse(b.data);
  if (b.visible !== undefined) patch.visible = b.visible;
  await db().update(t.items).set(patch).where(eq(t.items.id, id));
  refreshPublic();
  return ok();
});

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  await db().delete(t.items).where(eq(t.items.id, await idOf(ctx)));
  refreshPublic();
  return ok();
});
