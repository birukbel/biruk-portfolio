import { z } from "zod";

/** A bilingual string. Every visitor-facing text is stored in both languages. */
export type Bi = { am: string; en: string };
export type Lang = keyof Bi;
export const LANGS: Lang[] = ["en", "am"];

export type FieldType = "bi" | "bi-area" | "text" | "area" | "url" | "image" | "tags";

export type Field = {
  key: string;
  type: FieldType;
  label: Bi;
  hint?: Bi;
  optional?: boolean;
};

export const ITEM_KINDS = [
  "service",
  "experience",
  "project",
  "skill",
  "education",
  "certification",
  "gallery",
] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

const L = (en: string, am: string): Bi => ({ en, am });

/**
 * Single source of truth for every editable list on the site.
 * The admin form, the zod validation and the seed data are all derived from this.
 */
export const KIND_FIELDS: Record<ItemKind, { title: Bi; titleKey: string; fields: Field[] }> = {
  service: {
    title: L("What I do", "የምሰራቸው ስራዎች"),
    titleKey: "title",
    fields: [
      { key: "title", type: "bi", label: L("Title", "ርዕስ") },
      { key: "summary", type: "bi-area", label: L("Summary", "አጭር መግለጫ") },
      {
        key: "icon",
        type: "text",
        label: L("Icon (learn, code, chart, spark, users, globe)", "አዶ (learn, code, chart, spark, users, globe)"),
        optional: true,
      },
    ],
  },
  experience: {
    title: L("Experience", "የስራ ልምድ"),
    titleKey: "role",
    fields: [
      { key: "role", type: "bi", label: L("Role", "የስራ ድርሻ") },
      { key: "org", type: "text", label: L("Organisation", "ድርጅት") },
      { key: "place", type: "bi", label: L("Location", "ቦታ"), optional: true },
      { key: "start", type: "text", label: L("Start (e.g. 2023-03)", "መጀመሪያ (ለምሳሌ 2023-03)") },
      {
        key: "end",
        type: "text",
        label: L("End (blank = present)", "መጨረሻ (ባዶ = እስካሁን)"),
        optional: true,
      },
      { key: "summary", type: "bi-area", label: L("Summary", "አጭር መግለጫ") },
      {
        key: "bullets",
        type: "bi-area",
        label: L("Highlights (one per line)", "ዋና ዋና ስኬቶች (በእያንዳንዱ መስመር አንድ)"),
        optional: true,
      },
    ],
  },
  project: {
    title: L("Projects", "ፕሮጀክቶች"),
    titleKey: "title",
    fields: [
      { key: "title", type: "bi", label: L("Title", "ርዕስ") },
      { key: "summary", type: "bi-area", label: L("Summary", "አጭር መግለጫ") },
      { key: "tags", type: "tags", label: L("Tags (comma separated)", "መለያዎች (በኮማ የተለዩ)"), optional: true },
      { key: "url", type: "url", label: L("Live link", "የቀጥታ ሊንክ"), optional: true },
      { key: "repo", type: "url", label: L("Source code link", "የኮድ ሊንክ"), optional: true },
      { key: "image", type: "image", label: L("Cover image", "ምስል"), optional: true },
    ],
  },
  skill: {
    title: L("Skills", "ክህሎቶች"),
    titleKey: "group",
    fields: [
      { key: "group", type: "bi", label: L("Group name", "የቡድን ስም") },
      { key: "items", type: "tags", label: L("Skills (comma separated)", "ክህሎቶች (በኮማ የተለዩ)") },
    ],
  },
  education: {
    title: L("Education", "ትምህርት"),
    titleKey: "degree",
    fields: [
      { key: "degree", type: "bi", label: L("Degree", "ዲግሪ") },
      { key: "school", type: "text", label: L("Institution", "ተቋም") },
      { key: "start", type: "text", label: L("Start year", "መጀመሪያ ዓመት"), optional: true },
      { key: "end", type: "text", label: L("End year", "መጨረሻ ዓመት"), optional: true },
      { key: "note", type: "bi-area", label: L("Note", "ማስታወሻ"), optional: true },
    ],
  },
  certification: {
    title: L("Certifications", "ሰርተፊኬቶች"),
    titleKey: "title",
    fields: [
      { key: "title", type: "bi", label: L("Title", "ርዕስ") },
      { key: "issuer", type: "text", label: L("Issuer", "ሰጪ ድርጅት") },
      { key: "year", type: "text", label: L("Year", "ዓመት"), optional: true },
      { key: "url", type: "url", label: L("Credential link", "የሰርተፊኬት ሊንክ"), optional: true },
    ],
  },
  gallery: {
    title: L("Gallery", "ማዕከለ ስዕል"),
    titleKey: "alt",
    fields: [
      { key: "url", type: "image", label: L("Image", "ምስል") },
      { key: "alt", type: "bi", label: L("Description (alt text)", "መግለጫ (alt)") },
    ],
  },
};

const MAX_SHORT = 300;
const MAX_LONG = 4000;

/** http(s) links, site-relative paths, empty, or a {{PLACEHOLDER}}. Blocks javascript: and data: URLs. */
export const safeUrl = z
  .string()
  .max(1000)
  .refine(
    (v) => v === "" || /^https?:\/\//i.test(v) || v.startsWith("/") || /^\{\{[^}]*\}\}$/.test(v),
    "Must start with https://",
  );

const bi = (max: number) => z.object({ am: z.string().max(max), en: z.string().max(max) });

function fieldSchema(f: Field): z.ZodTypeAny {
  switch (f.type) {
    case "bi":
      return bi(MAX_SHORT);
    case "bi-area":
      return bi(MAX_LONG);
    case "text":
      return z.string().max(MAX_SHORT);
    case "area":
      return z.string().max(MAX_LONG);
    case "url":
    case "image":
      return safeUrl;
    case "tags":
      return z.array(z.string().trim().min(1).max(60)).max(40);
  }
}

export function itemSchema(kind: ItemKind) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of KIND_FIELDS[kind].fields) {
    const s = fieldSchema(f);
    shape[f.key] = f.optional ? s.optional() : s;
  }
  return z.object(shape).strip();
}

export function emptyItem(kind: ItemKind): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of KIND_FIELDS[kind].fields) {
    if (f.type === "bi" || f.type === "bi-area") out[f.key] = { en: "", am: "" };
    else if (f.type === "tags") out[f.key] = [];
    else out[f.key] = "";
  }
  return out;
}

/* ----------------------------- site-wide settings ----------------------------- */

export const profileSchema = z.object({
  name: bi(120),
  headline: bi(200),
  tagline: bi(400),
  about: bi(MAX_LONG),
  location: bi(120),
  availability: bi(200),
  email: z.string().max(200),
  phone: z.string().max(60),
  linkedin: safeUrl,
  github: safeUrl,
  telegram: safeUrl,
  youtube: safeUrl,
  cvUrl: safeUrl,
  avatarUrl: safeUrl,
  heroImage: safeUrl,
});
export type Profile = z.infer<typeof profileSchema>;

export const flagsSchema = z.object({
  services: z.boolean(),
  projects: z.boolean(),
  certifications: z.boolean(),
  gallery: z.boolean(),
  contactOpen: z.boolean(),
});
export type Flags = z.infer<typeof flagsSchema>;

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a #RRGGBB colour");
export const themeSchema = z.object({ accent: hex, accent2: hex });
export type Theme = z.infer<typeof themeSchema>;

export type Item = {
  id: number | string;
  kind: ItemKind;
  visible: boolean;
  sortOrder: number;
  data: Record<string, any>;
};

export type SiteContent = {
  profile: Profile;
  flags: Flags;
  theme: Theme;
  items: Item[];
};

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  body: z.string().trim().min(5).max(4000),
  /** honeypot: real users leave this empty */
  website: z.string().max(500).optional(),
});

/* --------------------------------- helpers --------------------------------- */

/** Pick a language, falling back to the other one so a half-translated site never shows blanks. */
export function pick(v: Bi | string | undefined | null, lang: Lang): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v[lang] || v[lang === "en" ? "am" : "en"] || "";
}

export function lines(v: Bi | undefined, lang: Lang): string[] {
  return pick(v, lang)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** "2023-03" -> "Mar 2023" / Ethiopian-calendar-agnostic, uses Gregorian labels in the chosen locale. */
export function formatMonth(value: string | undefined, lang: Lang): string {
  if (!value) return "";
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(value.trim());
  if (!m) return value;
  const [, y, mo] = m;
  if (!mo) return y;
  const d = new Date(Date.UTC(Number(y), Number(mo) - 1, 1));
  return new Intl.DateTimeFormat(lang === "am" ? "am-ET" : "en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Percent-safe slug-less helper used by the CV/contact links. */
export function isPlaceholder(v: string | undefined): boolean {
  return !v || /\{\{.*\}\}/.test(v);
}
