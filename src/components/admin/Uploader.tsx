"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import { useLang } from "@/lib/i18n";

const MAX_SIDE = 2400;

/** Resize big photos in the browser before upload (max 2400px, JPEG 85%). PDFs/GIFs pass through. */
export async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

/** Direct browser -> Vercel Blob upload (the file never goes through a serverless function). */
export async function uploadFile(file: File, onProgress?: (pct: number) => void): Promise<string> {
  const f = await shrink(file);
  const ctrl = new AbortController();
  // Never hang silently: give up if there is no progress for 90 seconds.
  let timer = setTimeout(() => ctrl.abort(), 90_000);
  try {
    const res = await upload(f.name, f, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      contentType: f.type,
      multipart: f.size > 4_000_000,
      abortSignal: ctrl.signal,
      onUploadProgress: ({ percentage }) => {
        clearTimeout(timer);
        timer = setTimeout(() => ctrl.abort(), 90_000);
        onProgress?.(Math.round(percentage));
      },
    });
    return res.url;
  } catch (e) {
    if (ctrl.signal.aborted) throw new Error("timed out (no progress for 90s). Check your internet, or try a smaller image");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function Uploader({ onDone, onError, multiple = false, accept = "image/*,application/pdf" }: {
  onDone: (urls: string[]) => void;
  onError: (msg: string) => void;
  multiple?: boolean;
  accept?: string;
}) {
  const { t } = useLang();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState<number | null>(null);

  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const urls: string[] = [];
    try {
      for (const f of Array.from(files)) urls.push(await uploadFile(f, setPct));
      onDone(urls);
    } catch (e) {
      onError(`${t("admin.upload.failed")}: ${(e as Error).message}`);
    } finally {
      setBusy(false);
      setPct(null);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <>
      <input ref={ref} type="file" hidden multiple={multiple} accept={accept} onChange={(e) => pick(e.target.files)} />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="btn btn-ghost !min-h-[44px]">
        {busy ? `${t("admin.upload.uploading")}${pct !== null ? ` ${pct}%` : ""}` : t("admin.upload.choose")}
      </button>
    </>
  );
}
