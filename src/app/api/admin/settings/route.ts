import { z } from "zod";
import { db, t } from "@/db";
import { handler, ok } from "@/lib/api";
import { flagsSchema, profileSchema, themeSchema } from "@/lib/kinds";
import { refreshPublic } from "@/lib/revalidate";

const body = z.object({
  profile: profileSchema.optional(),
  flags: flagsSchema.optional(),
  theme: themeSchema.optional(),
});

export const PUT = handler(async (req: Request) => {
  const b = body.parse(await req.json());
  for (const [key, value] of Object.entries(b)) {
    if (!value) continue;
    await db()
      .insert(t.siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: t.siteSettings.key, set: { value } });
  }
  refreshPublic();
  return ok();
});
