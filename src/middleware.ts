import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "@/lib/session";

const PUBLIC = ["/admin/login", "/api/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname)) return NextResponse.next();

  let ok = false;
  try {
    ok = await verifySession(req.cookies.get(COOKIE)?.value);
  } catch {
    ok = false; // SESSION_SECRET missing: fail closed
  }
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
