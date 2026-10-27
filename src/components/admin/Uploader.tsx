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
export async function uploadFile(file: File): Promise<string> {
  const f = await shrink(file);
  const res = await upload(f.name, f, { access: "public", handleUploadUrl: "/api/admin/upload", contentType: f.type });
  return res.url;
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

  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const urls: string[] = [];
    try {
      for (const f of Array.from(files)) urls.push(await uploadFile(f));
      onDone(urls);
    } catch (e) {
      onError(`${t("admin.upload.failed")}: ${(e as Error).message}`);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <>
      <input ref={ref} type="file" hidden multiple={multiple} accept={accept} onChange={(e) => pick(e.target.files)} />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="btn btn-ghost !min-h-[44px]">
        {busy ? t("admin.upload.uploading") : t("admin.upload.choose")}
      </button>
    </>
  );
}
