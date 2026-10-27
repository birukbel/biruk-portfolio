import { unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db, hasDb, t } from "@/db";
import { defaultContent } from "@/config/portfolio";
import {
  flagsSchema,
  profileSchema,
  themeSchema,
  type Item,
  type ItemKind,
  type SiteContent,
  ITEM_KINDS,
  KIND_FIELDS,
} from "./kinds";
import { hasPlaceholder, stripPlaceholders } from "./placeholder";

export const CONTENT_TAG = "content";

/** Reads straight from the database. Throws when it is unreachable or not seeded yet. */
export async function readFromDb(): Promise<SiteContent> {
  const settings = await db().select().from(t.siteSettings);
  const map = new Map(settings.map((s) => [s.key, s.value]));
  if (!map.has("profile")) throw new Error("Database not seeded");

  const rows = await db().select().from(t.items).orderBy(asc(t.items.sortOrder), asc(t.items.id));
  const items: Item[] = rows
    .filter((r) => (ITEM_KINDS as readonly string[]).includes(r.kind))
    .map((r) => ({
      id: r.id,
      kind: r.kind as ItemKind,
      visible: r.visible,
      sortOrder: r.sortOrder,
      data: r.data as Record<string, any>,
    }));

  return {
    profile: profileSchema.catch(defaultContent.profile).parse(map.get("profile")),
    flags: flagsSchema.catch(defaultContent.flags).parse(map.get("flags")),
    theme: themeSchema.catch(defaultContent.theme).parse(map.get("theme")),
    items,
  };
}

const cached = unstable_cache(readFromDb, ["site-content"], { tags: [CONTENT_TAG], revalidate: 3600 });

/**
 * Public read path. Never throws: if the database is down, unset, or empty we serve the
 * typed defaults. Errors thrown inside unstable_cache are not cached, so the next request retries.
 */
export async function getContent(): Promise<SiteContent> {
  if (!hasDb()) return defaultContent;
  try {
    return await cached();
  } catch (e) {
    console.error("[content] falling back to defaults:", (e as Error).message);
    return defaultContent;
  }
}

export { hasPlaceholder, scrub } from "./placeholder";

/** What visitors get: unfinished items dropped, leftover "{{...}}" text removed. */
export function publicContent(c: SiteContent): SiteContent {
  const items = c.items
    .filter((i) => i.visible && !hasPlaceholder(i.data[KIND_FIELDS[i.kind].titleKey]))
    .map((i) => ({ ...i, data: stripPlaceholders(i.data) }));
  return { ...c, profile: stripPlaceholders(c.profile), items };
}
