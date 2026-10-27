import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, t } from "@/db";
import { handler, ok } from "@/lib/api";
import { refreshPublic } from "@/lib/revalidate";

/** ids in the desired order; each gets sort_order = its index. */
export const POST = handler(async (req: Request) => {
  const { ids } = z.object({ ids: z.array(z.number().int()).max(500) }).parse(await req.json());
  await Promise.all(ids.map((id, i) => db().update(t.items).set({ sortOrder: i }).where(eq(t.items.id, id))));
  refreshPublic();
  return ok();
});
