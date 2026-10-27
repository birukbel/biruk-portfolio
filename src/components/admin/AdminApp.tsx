"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client-api";
import { useLang } from "@/lib/i18n";
import {
  ITEM_KINDS,
  KIND_FIELDS,
  emptyItem,
  pick,
  type Field,
  type Flags,
  type Item,
  type ItemKind,
  type Profile,
  type SiteContent,
  type Theme,
} from "@/lib/kinds";
import { FieldInput } from "./FieldInput";
import { Uploader } from "./Uploader";

type Data = { content: SiteContent; seeded: boolean; unseen: number };
type Toast = (msg: string, bad?: boolean) => void;
type Tab = "dashboard" | "profile" | ItemKind | "messages" | "settings";

const PROFILE_FIELDS: Field[] = [
  { key: "name", type: "bi", label: { en: "", am: "" } },
  { key: "headline", type: "bi", label: { en: "", am: "" } },
  { key: "tagline", type: "bi-area", label: { en: "", am: "" } },
  { key: "about", type: "bi-area", label: { en: "", am: "" } },
  { key: "location", type: "bi", label: { en: "", am: "" } },
  { key: "availability", type: "bi", label: { en: "", am: "" } },
  { key: "email", type: "text", label: { en: "", am: "" } },
  { key: "phone", type: "text", label: { en: "", am: "" } },
  { key: "linkedin", type: "url", label: { en: "", am: "" } },
  { key: "github", type: "url", label: { en: "", am: "" } },
  { key: "telegram", type: "url", label: { en: "", am: "" } },
  { key: "youtube", type: "url", label: { en: "", am: "" } },
  { key: "cvUrl", type: "image", label: { en: "", am: "" } },
  { key: "avatarUrl", type: "image", label: { en: "", am: "" } },
  { key: "heroImage", type: "image", label: { en: "", am: "" } },
];

export function AdminApp() {
  const { t, lang, setLang } = useLang();
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [toast, setToast] = useState<{ msg: string; bad: boolean } | null>(null);
  const [fatal, setFatal] = useState("");

  const say: Toast = useCallback((msg, bad = false) => {
    setToast({ msg, bad });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const reload = useCallback(async () => {
    try {
      setData(await api<Data>("/api/admin/all"));
    } catch (e) {
      setFatal((e as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const tabs = useMemo(
    () => [
      { id: "dashboard" as Tab, label: t("admin.tabs.dashboard") },
      { id: "profile" as Tab, label: t("admin.tabs.profile") },
      ...ITEM_KINDS.map((k) => ({ id: k as Tab, label: pick(KIND_FIELDS[k].title, lang) })),
      { id: "messages" as Tab, label: `${t("admin.tabs.messages")}${data?.unseen ? ` (${data.unseen})` : ""}` },
      { id: "settings" as Tab, label: t("admin.tabs.settings") },
    ],
    [t, lang, data?.unseen],
  );

  async function logout() {
    await api("/api/admin/logout", "POST");
    window.location.href = "/admin/login";
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24">
      <header className="sticky top-0 z-30 -mx-4 border-b border-line bg-ink/90 px-4 backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>
          <div className="flex items-center gap-2 text-sm">
            <button className="chip min-h-[40px]" onClick={() => setLang(lang === "en" ? "am" : "en")}>{lang === "en" ? "አማ" : "EN"}</button>
            <a href="/" target="_blank" rel="noopener" className="chip inline-flex min-h-[40px] items-center">{t("admin.viewSite")}</a>
            <button className="chip min-h-[40px]" onClick={logout}>{t("admin.logout")}</button>
          </div>
        </div>
        <div role="tablist" aria-label={t("admin.title")} className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2">
          {tabs.map((x) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={`min-h-[40px] shrink-0 rounded-full px-4 text-sm font-medium ${tab === x.id ? "bg-accent text-ink" : "border border-line text-mute"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </header>

      <main className="pt-6">
        {fatal && <p role="alert" className="card p-4 text-red-300">{t("admin.error")}: {fatal}</p>}
        {!data && !fatal && <p className="text-mute">...</p>}
        {data && tab === "dashboard" && <Dashboard data={data} reload={reload} say={say} go={setTab} />}
        {data && tab === "profile" && <ProfilePanel profile={data.content.profile} reload={reload} say={say} />}
        {data && (ITEM_KINDS as readonly string[]).includes(tab) && (
          <ItemsPanel key={tab} kind={tab as ItemKind} items={data.content.items.filter((i) => i.kind === tab)} reload={reload} say={say} />
        )}
        {data && tab === "messages" && <MessagesPanel say={say} reload={reload} />}
        {data && tab === "settings" && <SettingsPanel flags={data.content.flags} theme={data.content.theme} reload={reload} say={say} />}
      </main>

      {toast && (
        <div role="status" aria-live="polite" className={`fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-xl px-4 py-3 text-center text-sm font-medium shadow-lg ${toast.bad ? "bg-red-500 text-white" : "bg-accent text-ink"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- dashboard ------------------------------- */

function Dashboard({ data, reload, say, go }: { data: Data; reload: () => void; say: Toast; go: (t: Tab) => void }) {
  const { t, lang } = useLang();
  const counts = ITEM_KINDS.map((k) => ({ k, n: data.content.items.filter((i) => i.kind === k).length }));
  async function seed() {
    try {
      await api("/api/admin/seed", "POST");
      say(t("admin.saved"));
      reload();
    } catch (e) {
      say((e as Error).message, true);
    }
  }
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold">{t("admin.dashboard.welcome")}, {pick(data.content.profile.name, lang)}</h2>
      {!data.seeded && (
        <div className="card space-y-3 border-accent2 p-5">
          <p>{t("admin.dashboard.notSeeded")}</p>
          <button className="btn btn-primary" onClick={seed}>{t("admin.dashboard.seed")}</button>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => go("messages")} className="card p-5 text-left">
          <p className="text-4xl font-semibold text-accent">{data.unseen}</p>
          <p className="text-mute">{t("admin.dashboard.unseen")}</p>
        </button>
        {counts.map(({ k, n }) => (
          <button key={k} onClick={() => go(k)} className="card p-5 text-left">
            <p className="text-4xl font-semibold">{n}</p>
            <p className="text-mute">{pick(KIND_FIELDS[k].title, lang)} · {t("admin.dashboard.items")}</p>
          </button>
        ))}
      </div>
      <p className="text-sm text-mute">{t("admin.dashboard.fallback")}</p>
    </div>
  );
}

/* -------------------------------- profile -------------------------------- */

function ProfilePanel({ profile, reload, say }: { profile: Profile; reload: () => void; say: Toast }) {
  const { t } = useLang();
  const [draft, setDraft] = useState<Profile>(profile);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await api("/api/admin/settings", "PUT", { profile: draft });
      say(t("admin.saved"));
      reload();
    } catch (e) {
      say((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {PROFILE_FIELDS.map((f) => (
        <FieldInput
          key={f.key}
          field={f}
          label={t(`admin.profile.${f.key}`)}
          value={(draft as any)[f.key]}
          onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
          onError={(m) => say(m, true)}
        />
      ))}
      <button type="submit" disabled={busy} className="btn btn-primary w-full sm:w-auto">{busy ? t("admin.saving") : t("admin.save")}</button>
    </form>
  );
}

/* --------------------------------- items --------------------------------- */

function ItemsPanel({ kind, items, reload, say }: { kind: ItemKind; items: Item[]; reload: () => void; say: Toast }) {
  const { t, lang } = useLang();
  const def = KIND_FIELDS[kind];
  const [editing, setEditing] = useState<{ id: number | null; data: Record<string, any>; visible: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>, done = true) => {
    setBusy(true);
    try {
      await fn();
      if (done) say(t("admin.saved"));
      await reload();
    } catch (e) {
      say((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  const save = () =>
    run(async () => {
      if (!editing) return;
      if (editing.id === null) await api("/api/admin/items", "POST", { kind, data: editing.data, visible: editing.visible });
      else await api(`/api/admin/items/${editing.id}`, "PUT", { data: editing.data, visible: editing.visible });
      setEditing(null);
    });

  const move = (idx: number, dir: -1 | 1) => {
    const ids = items.map((i) => Number(i.id));
    const j = idx + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[idx], ids[j]] = [ids[j], ids[idx]];
    run(() => api("/api/admin/items/reorder", "POST", { ids }), false);
  };

  const addPhotos = (urls: string[]) =>
    run(async () => {
      for (const url of urls) await api("/api/admin/items", "POST", { kind, data: { url, alt: { en: "", am: "" } }, visible: true });
    });

  if (editing) {
    return (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <h2 className="text-3xl font-semibold">{editing.id === null ? t("admin.add") : t("admin.edit")}</h2>
        {def.fields.map((f) => (
          <FieldInput
            key={`${editing.id}-${f.key}`}
            field={f}
            label={pick(f.label, lang)}
            value={editing.data[f.key]}
            onChange={(v) => setEditing((s) => (s ? { ...s, data: { ...s.data, [f.key]: v } } : s))}
            onError={(m) => say(m, true)}
          />
        ))}
        <label className="flex min-h-[44px] items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--accent))]" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} />
          {t("admin.visible")}
        </label>
        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn btn-primary">{busy ? t("admin.saving") : t("admin.save")}</button>
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>{t("admin.cancel")}</button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold">{pick(def.title, lang)}</h2>
        <div className="flex gap-2">
          {kind === "gallery" && <Uploader multiple accept="image/*" onDone={addPhotos} onError={(m) => say(m, true)} />}
          {kind !== "gallery" && (
            <button className="btn btn-primary" onClick={() => setEditing({ id: null, data: emptyItem(kind), visible: true })}>{t("admin.add")}</button>
          )}
        </div>
      </div>
      {items.length === 0 && <p className="text-mute">{t("admin.empty")}</p>}
      <ul className="space-y-3">
        {items.map((it, idx) => {
          const title = pick(it.data[def.titleKey], lang) || String(it.data[def.titleKey] ?? "") || "(untitled)";
          return (
            <li key={it.id} className={`card flex flex-wrap items-center gap-3 p-4 ${it.visible ? "" : "opacity-60"}`}>
              {kind === "gallery" && it.data.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.data.url} alt="" className="h-14 w-14 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{title}</p>
                {!it.visible && <p className="text-xs text-accent2">{t("admin.hidden")}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <button aria-label={t("admin.up")} disabled={busy || idx === 0} onClick={() => move(idx, -1)} className="chip min-h-[44px] min-w-[44px]">↑</button>
                <button aria-label={t("admin.down")} disabled={busy || idx === items.length - 1} onClick={() => move(idx, 1)} className="chip min-h-[44px] min-w-[44px]">↓</button>
                <button className="chip min-h-[44px]" onClick={() => setEditing({ id: Number(it.id), data: { ...emptyItem(kind), ...it.data }, visible: it.visible })}>{t("admin.edit")}</button>
                <button
                  className="chip min-h-[44px] text-red-300"
                  onClick={() => confirm(t("admin.confirmDelete")) && run(() => api(`/api/admin/items/${it.id}`, "DELETE"))}
                >
                  {t("admin.delete")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------- messages ------------------------------- */

type Msg = { id: number; name: string; email: string; body: string; seen: boolean; createdAt: string };

function MessagesPanel({ say, reload }: { say: Toast; reload: () => void }) {
  const { t, lang } = useLang();
  const [rows, setRows] = useState<Msg[] | null>(null);

  const load = useCallback(async () => {
    try {
      setRows((await api<{ messages: Msg[] }>("/api/admin/messages")).messages);
    } catch (e) {
      say((e as Error).message, true);
    }
  }, [say]);
  useEffect(() => {
    load();
  }, [load]);

  async function act(fn: () => Promise<unknown>) {
    try {
      await fn();
      await load();
      reload();
    } catch (e) {
      say((e as Error).message, true);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">{t("admin.tabs.messages")}</h2>
        <a href="/api/admin/messages/export" className="btn btn-ghost">{t("admin.messages.csv")}</a>
      </div>
      {rows?.length === 0 && <p className="text-mute">{t("admin.messages.none")}</p>}
      <ul className="space-y-3">
        {rows?.map((m) => (
          <li key={m.id} className={`card space-y-2 p-4 ${m.seen ? "opacity-70" : "border-accent/60"}`}>
            <p className="text-sm text-mute">
              {t("admin.messages.from")} <b className="text-fg">{m.name}</b> ·{" "}
              <a className="text-accent" href={`mailto:${m.email}`}>{m.email}</a> ·{" "}
              {new Date(m.createdAt).toLocaleString(lang === "am" ? "am-ET" : "en-GB", { timeZone: "Africa/Addis_Ababa" })}
            </p>
            <p className="whitespace-pre-wrap break-words">{m.body}</p>
            <div className="flex gap-2">
              <button className="chip min-h-[44px]" onClick={() => act(() => api(`/api/admin/messages/${m.id}`, "PATCH", { seen: !m.seen }))}>
                {m.seen ? t("admin.messages.markUnseen") : t("admin.messages.markSeen")}
              </button>
              <button className="chip min-h-[44px] text-red-300" onClick={() => confirm(t("admin.confirmDelete")) && act(() => api(`/api/admin/messages/${m.id}`, "DELETE"))}>
                {t("admin.delete")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------- settings ------------------------------- */

function SettingsPanel({ flags, theme, reload, say }: { flags: Flags; theme: Theme; reload: () => void; say: Toast }) {
  const { t } = useLang();
  const [f, setF] = useState<Flags>(flags);
  const [th, setTh] = useState<Theme>(theme);

  async function save() {
    try {
      await api("/api/admin/settings", "PUT", { flags: f, theme: th });
      say(t("admin.saved"));
      reload();
    } catch (e) {
      say((e as Error).message, true);
    }
  }

  async function importFile(file: File | undefined) {
    if (!file || !confirm(t("admin.settings.importWarn"))) return;
    try {
      await api("/api/admin/import", "POST", JSON.parse(await file.text()));
      say(t("admin.settings.imported"));
      reload();
    } catch (e) {
      say((e as Error).message, true);
    }
  }

  const flagKeys: (keyof Flags)[] = ["services", "projects", "certifications", "gallery", "contactOpen"];
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-3xl font-semibold">{t("admin.settings.sections")}</h2>
        {flagKeys.map((k) => (
          <label key={k} className="flex min-h-[44px] items-center gap-3">
            <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--accent))]" checked={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} />
            {t(`admin.settings.${k}`)}
          </label>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-3xl font-semibold">{t("admin.settings.theme")}</h2>
        <div className="flex flex-wrap gap-6">
          {(["accent", "accent2"] as const).map((k) => (
            <label key={k} className="flex items-center gap-3">
              <input type="color" className="h-11 w-14 rounded border border-line bg-transparent" value={th[k]} onChange={(e) => setTh({ ...th, [k]: e.target.value })} />
              {t(`admin.settings.${k}`)}
            </label>
          ))}
        </div>
      </section>
      <button className="btn btn-primary" onClick={save}>{t("admin.save")}</button>
      <section className="card space-y-3 p-5">
        <h2 className="text-2xl font-semibold">{t("admin.settings.backup")}</h2>
        <div className="flex flex-wrap gap-3">
          <a className="btn btn-ghost" href="/api/admin/export">{t("admin.settings.export")}</a>
          <label className="btn btn-ghost cursor-pointer">
            {t("admin.settings.import")}
            <input type="file" accept="application/json" hidden onChange={(e) => importFile(e.target.files?.[0])} />
          </label>
        </div>
      </section>
    </div>
  );
}
