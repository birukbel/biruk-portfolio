"use client";

import { LANGS, type Bi, type Field } from "@/lib/kinds";
import { useLang } from "@/lib/i18n";
import { Uploader } from "./Uploader";

type Props = { field: Field; label: string; value: any; onChange: (v: any) => void; onError: (m: string) => void };

export function FieldInput({ field, label, value, onChange, onError }: Props) {
  const { t } = useLang();
  const id = `f-${field.key}`;

  if (field.type === "bi" || field.type === "bi-area") {
    const v = (value ?? { en: "", am: "" }) as Bi;
    const area = field.type === "bi-area";
    return (
      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm text-mute">{label}</legend>
        {LANGS.map((l) => (
          <div key={l} className="flex items-start gap-2">
            <label htmlFor={`${id}-${l}`} className="mt-3 w-9 shrink-0 text-xs font-semibold uppercase text-accent2">
              {l === "en" ? "EN" : "አማ"}
            </label>
            {area ? (
              <textarea id={`${id}-${l}`} rows={4} className="input resize-y" value={v[l]} onChange={(e) => onChange({ ...v, [l]: e.target.value })} />
            ) : (
              <input id={`${id}-${l}`} className="input" value={v[l]} onChange={(e) => onChange({ ...v, [l]: e.target.value })} />
            )}
          </div>
        ))}
      </fieldset>
    );
  }

  if (field.type === "tags") {
    const arr: string[] = Array.isArray(value) ? value : [];
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm text-mute">{label}</label>
        <input
          id={id}
          className="input"
          defaultValue={arr.join(", ")}
          onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
        />
      </div>
    );
  }

  if (field.type === "image") {
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm text-mute">{label}</label>
        <div className="flex flex-wrap items-center gap-2">
          <input id={id} className="input min-w-0 flex-1" value={value ?? ""} placeholder="https://..." onChange={(e) => onChange(e.target.value)} />
          <Uploader onDone={(u) => onChange(u[0])} onError={onError} />
          {value && <button type="button" className="btn btn-ghost !min-h-[44px]" onClick={() => onChange("")}>{t("admin.upload.remove")}</button>}
        </div>
        {value && /\.(jpe?g|png|webp|avif)(\?|$)/i.test(value) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="mt-2 h-24 w-auto rounded-lg border border-line object-cover" />
        )}
      </div>
    );
  }

  if (field.type === "area") {
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm text-mute">{label}</label>
        <textarea id={id} rows={4} className="input resize-y" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-mute">{label}</label>
      <input id={id} className="input" type={field.type === "url" ? "url" : "text"} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
