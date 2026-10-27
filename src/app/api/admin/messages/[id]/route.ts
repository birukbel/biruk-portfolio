import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, t } from "@/db";
import { handler, ok } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };
const idOf = async (c: Ctx) => z.coerce.number().int().positive().parse((await c.params).id);

export const PATCH = handler(async (req: Request, ctx: Ctx) => {
  const { seen } = z.object({ seen: z.boolean() }).parse(await req.json());
  await db().update(t.messages).set({ seen }).where(eq(t.messages.id, await idOf(ctx)));
  return ok();
});

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  await db().delete(t.messages).where(eq(t.messages.id, await idOf(ctx)));
  return ok();
});
