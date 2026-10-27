import { and, count, eq, gt } from "drizzle-orm";
import { db, t } from "@/db";

export type Decision = { allowed: boolean; remaining: number };

/** Pure decision, unit-tested. */
export function decide(hits: number, max: number): Decision {
  return { allowed: hits < max, remaining: Math.max(0, max - hits) };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim().slice(0, 64);
}

/**
 * Database-backed limiter (in-memory counters do not survive Vercel serverless).
 * Records a hit and returns whether the caller is still under the limit.
 */
export async function hit(key: string, ip: string, max: number, windowMs: number): Promise<Decision> {
  const since = new Date(Date.now() - windowMs);
  const [row] = await db()
    .select({ n: count() })
    .from(t.rateLimitHits)
    .where(and(eq(t.rateLimitHits.key, key), eq(t.rateLimitHits.ip, ip), gt(t.rateLimitHits.createdAt, since)));
  const d = decide(row?.n ?? 0, max);
  if (d.allowed) await db().insert(t.rateLimitHits).values({ key, ip });
  return d;
}

/** Login attempts use their own table so failed logins can be audited. */
export async function loginAllowed(ip: string): Promise<Decision> {
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const [row] = await db()
    .select({ n: count() })
    .from(t.loginAttempts)
    .where(and(eq(t.loginAttempts.ip, ip), gt(t.loginAttempts.createdAt, since)));
  return decide(row?.n ?? 0, 5);
}

export async function recordFailedLogin(ip: string) {
  await db().insert(t.loginAttempts).values({ ip });
}
