import { db, t } from "@/db";
import { handler, ok } from "@/lib/api";
import { parseBackup } from "@/lib/backup";
import { refreshPublic } from "@/lib/revalidate";

/** Replaces all content. The file is fully validated first and the write runs as one batch (transaction). */
export const POST = handler(async (req: Request) => {
  const b = parseBackup(await req.json());
  const d = db();
  const ops: any[] = [
    d.delete(t.items),
    d
      .insert(t.siteSettings)
      .values({ key: "profile", value: b.profile })
      .onConflictDoUpdate({ target: t.siteSettings.key, set: { value: b.profile } }),
    d
      .insert(t.siteSettings)
      .values({ key: "flags", value: b.flags })
      .onConflictDoUpdate({ target: t.siteSettings.key, set: { value: b.flags } }),
    d
      .insert(t.siteSettings)
      .values({ key: "theme", value: b.theme })
      .onConflictDoUpdate({ target: t.siteSettings.key, set: { value: b.theme } }),
  ];
  if (b.items.length) ops.push(d.insert(t.items).values(b.items.map((i) => ({ ...i, data: i.data }))));
  await d.batch(ops as [any, ...any[]]);
  refreshPublic();
  return ok({ items: b.items.length });
});
