import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { bad, handler, ok } from "@/lib/api";
import { COOKIE, verifySession } from "@/lib/session";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"];

/**
 * Issues a short-lived client token. The browser then uploads straight to Vercel Blob,
 * so the file never passes through this function (Vercel caps request bodies at ~4.5 MB).
 */
export const POST = handler(async (req: Request) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return bad("Blob storage is not configured", 503);
  const body = (await req.json()) as HandleUploadBody;
  const jar = await cookies();
  if (!(await verifySession(jar.get(COOKIE)?.value))) return bad("Unauthorized", 401);

  const res = await handleUpload({
    body,
    request: req,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: TYPES,
      maximumSizeInBytes: 12 * 1024 * 1024,
      addRandomSuffix: true,
    }),
    // No onUploadCompleted: that webhook would arrive without the admin cookie.
  });
  return ok(res);
});
