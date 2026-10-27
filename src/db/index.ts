import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cached: ReturnType<typeof create> | null = null;

function create(url: string) {
  return drizzle(neon(url), { schema });
}

/** Lazy so that importing this file never throws (the build must work without a database). */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return (cached ??= create(url));
}

export const hasDb = () => Boolean(process.env.DATABASE_URL);
export * as t from "./schema";
