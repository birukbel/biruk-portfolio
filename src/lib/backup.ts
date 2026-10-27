import { z } from "zod";
import { ITEM_KINDS, flagsSchema, itemSchema, profileSchema, themeSchema } from "./kinds";

export const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().optional(),
  profile: profileSchema,
  flags: flagsSchema,
  theme: themeSchema,
  items: z
    .array(
      z.object({
        kind: z.enum(ITEM_KINDS),
        visible: z.boolean(),
        sortOrder: z.number().int(),
        data: z.record(z.string(), z.unknown()),
      }),
    )
    .max(500),
});
export type Backup = z.infer<typeof backupSchema>;

/** Validate the whole file, including every item against its kind's schema, before touching the DB. */
export function parseBackup(raw: unknown): Backup {
  const b = backupSchema.parse(raw);
  const items = b.items.map((i) => ({ ...i, data: itemSchema(i.kind).parse(i.data) as Record<string, unknown> }));
  return { ...b, items };
}
