"use client";

import { useState, type FormEvent } from "react";
import { useLang } from "@/lib/i18n";

export function ContactForm() {
  const { t } = useLang();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5 sm:p-7" noValidate={false}>
      <div>
        <label htmlFor="c-name" className="mb-1 block text-sm text-mute">{t("contact.name")}</label>
        <input id="c-name" name="name" required maxLength={120} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="c-email" className="mb-1 block text-sm text-mute">{t("contact.email")}</label>
        <input id="c-email" name="email" type="email" required maxLength={200} autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="c-body" className="mb-1 block text-sm text-mute">{t("contact.message")}</label>
        <textarea id="c-body" name="body" required minLength={5} maxLength={4000} rows={5} className="input resize-y" />
      </div>
      {/* honeypot: hidden from people and screen readers, bots fill it in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <button type="submit" disabled={state === "sending"} className="btn btn-primary w-full sm:w-auto">
        {state === "sending" ? t("contact.sending") : t("contact.send")}
      </button>
      <p role="status" aria-live="polite" className={`text-sm ${state === "error" ? "text-red-300" : "text-accent"}`}>
        {state === "sent" && t("contact.sent")}
        {state === "error" && t("contact.error")}
      </p>
    </form>
  );
}
