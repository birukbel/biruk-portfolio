import { handler } from "@/lib/api";
import { readFromDb } from "@/lib/content";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const c = await readFromDb();
  const body = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: c.profile,
    flags: c.flags,
    theme: c.theme,
    items: c.items.map(({ kind, visible, sortOrder, data }) => ({ kind, visible, sortOrder, data })),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="portfolio-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
});
