import { handler, ok } from "@/lib/api";
import { refreshPublic } from "@/lib/revalidate";
import { seed } from "@/lib/seed";

export const POST = handler(async () => {
  const r = await seed();
  refreshPublic();
  return ok(r);
});
