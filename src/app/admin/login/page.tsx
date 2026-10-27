"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/client-api";
import { useLang } from "@/lib/i18n";

export default function LoginPage() {
  const { t, lang, setLang } = useLang();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/login", "POST", { password: new FormData(e.currentTarget).get("password") });
      window.location.href = "/admin";
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-7">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">{t("admin.login")}</h1>
          <button type="button" className="chip min-h-[36px]" onClick={() => setLang(lang === "en" ? "am" : "en")}>
            {lang === "en" ? "አማ" : "EN"}
          </button>
        </div>
        <div>
          <label htmlFor="pw" className="mb-1 block text-sm text-mute">{t("admin.password")}</label>
          <input id="pw" name="password" type="password" required autoComplete="current-password" className="input" autoFocus />
        </div>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary w-full">{t("admin.enter")}</button>
      </form>
    </main>
  );
}
