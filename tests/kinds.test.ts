import { describe, expect, it } from "vitest";
import { defaultContent, defaultFlags, defaultItems, defaultProfile, defaultTheme } from "@/config/portfolio";
import { flagsSchema, formatMonth, itemSchema, lines, pick, profileSchema, safeUrl, themeSchema, emptyItem, ITEM_KINDS } from "@/lib/kinds";

describe("pick", () => {
  it("returns the requested language", () => {
    expect(pick({ en: "Hi", am: "ሰላም" }, "am")).toBe("ሰላም");
    expect(pick({ en: "Hi", am: "ሰላም" }, "en")).toBe("Hi");
  });
  it("falls back to the other language instead of showing blanks", () => {
    expect(pick({ en: "Hi", am: "" }, "am")).toBe("Hi");
    expect(pick({ en: "", am: "ሰላም" }, "en")).toBe("ሰላም");
  });
  it("handles missing values and plain strings", () => {
    expect(pick(undefined, "en")).toBe("");
    expect(pick("x", "am")).toBe("x");
  });
});

describe("lines", () => {
  it("splits, trims and drops empty lines", () => {
    expect(lines({ en: " a \n\n b\r\nc ", am: "" }, "en")).toEqual(["a", "b", "c"]);
  });
});

describe("formatMonth", () => {
  it("formats YYYY-MM in English", () => {
    expect(formatMonth("2023-03", "en")).toMatch(/Mar(ch)? 2023/);
  });
  it("keeps bare years and passes unknown text through", () => {
    expect(formatMonth("2021", "en")).toBe("2021");
    expect(formatMonth("Spring", "en")).toBe("Spring");
    expect(formatMonth("", "en")).toBe("");
  });
});

describe("safeUrl", () => {
  it("accepts https, http, relative paths and empty", () => {
    for (const ok of ["https://a.com", "http://a.com/x", "/cv.pdf", ""]) expect(safeUrl.safeParse(ok).success).toBe(true);
  });
  it("rejects script and data URLs", () => {
    for (const bad of ["javascript:alert(1)", "data:text/html;base64,AA", "ftp://x", "mailto:a@b.c"]) {
      expect(safeUrl.safeParse(bad).success).toBe(false);
    }
  });
});

describe("itemSchema", () => {
  it("accepts an empty item for every kind only when required fields are fine", () => {
    for (const kind of ITEM_KINDS) {
      const r = itemSchema(kind).safeParse(emptyItem(kind));
      // empty strings are valid text; tags arrays are valid; bi objects are valid
      expect(r.success, kind).toBe(true);
    }
  });
  it("rejects a javascript: link in a project", () => {
    const data = { ...emptyItem("project"), url: "javascript:alert(1)" };
    expect(itemSchema("project").safeParse(data).success).toBe(false);
  });
  it("strips unknown keys", () => {
    const r = itemSchema("service").parse({ ...emptyItem("service"), evil: "x" });
    expect(r).not.toHaveProperty("evil");
  });
  it("rejects oversize text", () => {
    const data = { ...emptyItem("service"), title: { en: "x".repeat(400), am: "" } };
    expect(itemSchema("service").safeParse(data).success).toBe(false);
  });
});

describe("default content", () => {
  it("validates against the same schemas the admin uses", () => {
    expect(profileSchema.safeParse(defaultProfile).success).toBe(true);
    expect(flagsSchema.safeParse(defaultFlags).success).toBe(true);
    expect(themeSchema.safeParse(defaultTheme).success).toBe(true);
    for (const i of defaultItems) expect(itemSchema(i.kind).safeParse(i.data).success, `${i.kind}`).toBe(true);
  });
  it("is complete in both languages", () => {
    const walk = (v: unknown, path: string) => {
      if (v && typeof v === "object" && "en" in v && "am" in v) {
        const b = v as { en: string; am: string };
        if (b.en || b.am) expect(Boolean(b.en) && Boolean(b.am), `${path} missing a translation`).toBe(true);
      } else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`));
    };
    walk(defaultContent, "content");
  });
});
