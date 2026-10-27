import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { bad, handler } from "@/lib/api";
import { clientIp, loginAllowed, recordFailedLogin } from "@/lib/rate-limit";
import { COOKIE, cookieOptions, signSession } from "@/lib/session";

export const runtime = "nodejs";

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const POST = handler(async (req: Request) => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.SESSION_SECRET) return bad("Admin is not configured", 503);

  const { password } = z.object({ password: z.string().max(200) }).parse(await req.json());
  const ip = clientIp(req);

  let gate;
  try {
    gate = await loginAllowed(ip);
  } catch {
    return bad("Database unavailable, try again shortly", 503);
  }
  if (!gate.allowed) return bad("Too many attempts. Try again in 15 minutes.", 429);

  if (!same(password, expected)) {
    await recordFailedLogin(ip);
    return bad("Wrong password", 401);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signSession(), cookieOptions);
  return res;
});
