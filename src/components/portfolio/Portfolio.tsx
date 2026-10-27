"use client";

import type { ReactNode } from "react";
import { hasPlaceholder, scrub } from "@/lib/placeholder";
import { formatMonth, lines, pick, type Item, type SiteContent } from "@/lib/kinds";
import { useLang } from "@/lib/i18n";
import { ContactForm } from "./ContactForm";
import { CrossDivider, Icon } from "./Icons";
import { Nav, type NavLink } from "./Nav";
import { Reveal } from "./Reveal";

const real = (v: string) => (v && !hasPlaceholder(v) ? v : "");

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <Reveal>
        <h2 id={`${id}-h`} className="mb-10 text-4xl font-semibold sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}

export function Portfolio({ content }: { content: SiteContent }) {
  const { lang, t } = useLang();
  const { profile: p, flags } = content;

  const of = (kind: Item["kind"], titleKey: string) =>
    content.items.filter((i) => i.kind === kind && i.visible && !hasPlaceholder(i.data[titleKey]));

  const services = flags.services ? of("service", "title") : [];
  const experience = of("experience", "role");
  const projects = flags.projects ? of("project", "title") : [];
  const skills = of("skill", "group");
  const education = of("education", "degree");
  const certs = flags.certifications ? of("certification", "title") : [];
  const gallery = flags.gallery ? content.items.filter((i) => i.kind === "gallery" && i.visible && real(i.data.url)) : [];

  const name = pick(p.name, lang);
  const email = real(p.email);
  const phone = real(p.phone);
  const cv = real(p.cvUrl);
  const socials = [
    { label: "LinkedIn", href: real(p.linkedin) },
    { label: "GitHub", href: real(p.github) },
    { label: "Telegram", href: real(p.telegram) },
    { label: "YouTube", href: real(p.youtube) },
  ].filter((s) => s.href);

  const links: NavLink[] = [
    { id: "about", key: "about" },
    services.length ? { id: "services", key: "services" } : null,
    experience.length ? { id: "experience", key: "experience" } : null,
    projects.length ? { id: "projects", key: "projects" } : null,
    skills.length ? { id: "skills", key: "skills" } : null,
    education.length || certs.length ? { id: "education", key: "education" } : null,
    gallery.length ? { id: "gallery", key: "gallery" } : null,
    { id: "contact", key: "contact" },
  ].filter(Boolean) as NavLink[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name.en,
    alternateName: p.name.am,
    jobTitle: "Instant Network School (DIY) Coach",
    worksFor: { "@type": "Organization", name: "Amref Health Africa" },
    alumniOf: ["CPU College", "Wachemo University"],
    knowsLanguage: ["am", "en"],
    sameAs: socials.map((s) => s.href),
    url: process.env.NEXT_PUBLIC_SITE_URL,
  };

  return (
    <div id="top" className="bg-tech">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-ink"
      >
        {t("nav.skip")}
      </a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Nav links={links} name={name} />

      <main>
        {/* ------------------------------- hero ------------------------------- */}
        <section className="relative isolate overflow-hidden" aria-labelledby="hero-h">
          {real(p.heroImage) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.heroImage} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25" fetchPriority="high" />
          )}
          <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.25em] text-accent">{t("hero.hello")}</p>
              <h1 id="hero-h" className="text-6xl font-semibold leading-[1.02] sm:text-7xl lg:text-8xl">
                {name}
              </h1>
              <p className="mt-5 font-serif text-2xl text-accent2 sm:text-3xl">{pick(p.headline, lang)}</p>
              <p className="mt-6 max-w-xl text-lg text-mute">{pick(p.tagline, lang)}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#contact" className="btn btn-primary">
                  {t("hero.contact")} <Icon name="arrow" size={18} />
                </a>
                {cv && (
                  <a href={cv} target="_blank" rel="noopener" className="btn btn-ghost">
                    <Icon name="download" size={18} /> {t("hero.cv")}
                  </a>
                )}
              </div>
              {socials.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-mute">
                  {socials.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 hover:text-accent">
                        <Icon name="link" size={16} /> {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mx-auto w-full max-w-sm">
              {real(p.avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.avatarUrl}
                  alt={name}
                  width={480}
                  height={600}
                  className="aspect-[4/5] w-full rounded-[2rem] border border-line object-cover"
                />
              ) : (
                <div className="card relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[2rem]">
                  <span className="font-serif text-8xl text-accent/80" aria-hidden="true">
                    {(pick(p.name, "en")[0] ?? "B") + (pick(p.name, "en").split(" ")[1]?.[0] ?? "")}
                  </span>
                  <CrossDivider className="absolute inset-x-6 bottom-6" />
                </div>
              )}
            </div>
          </div>
          <a href="#about" className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-mute md:block">
            {t("hero.scroll")}
          </a>
        </section>

        <CrossDivider className="mx-auto max-w-6xl px-5" />

        {/* ------------------------------- about ------------------------------ */}
        <Section id="about" title={t("sections.about")}>
          <Reveal>
            <div className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
              <div className="space-y-5 text-lg text-fg/90">
                {lines(p.about, lang).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <dl className="card h-fit space-y-4 p-6 text-sm">
                <div>
                  <dt className="text-mute">{t("labels.location")}</dt>
                  <dd className="text-base">{pick(p.location, lang)}</dd>
                </div>
                <div>
                  <dd className="text-accent">{pick(p.availability, lang)}</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </Section>

        {/* ------------------------------ services ---------------------------- */}
        {services.length > 0 && (
          <Section id="services" title={t("sections.services")}>
            <div className="grid gap-5 sm:grid-cols-2">
              {services.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.06}>
                  <article className="card h-full p-6">
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                      <Icon name={s.data.icon || "spark"} />
                    </div>
                    <h3 className="text-2xl font-semibold">{pick(s.data.title, lang)}</h3>
                    <p className="mt-2 text-mute">{pick(s.data.summary, lang)}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* ----------------------------- experience --------------------------- */}
        {experience.length > 0 && (
          <Section id="experience" title={t("sections.experience")}>
            <ol className="relative space-y-8 border-l border-line pl-6 sm:pl-8">
              {experience.map((x) => {
                const start = formatMonth(scrub(x.data.start || ""), lang);
                const end = x.data.end ? formatMonth(scrub(x.data.end), lang) : t("labels.present");
                const bullets = lines(x.data.bullets, lang).filter((b) => !hasPlaceholder(b));
                return (
                  <li key={x.id} className="relative">
                    <span className="absolute -left-[1.9rem] top-2 h-3 w-3 rounded-full border-2 border-accent bg-ink sm:-left-[2.4rem]" aria-hidden="true" />
                    <Reveal>
                      <article className="card p-6">
                        <p className="text-sm text-accent">
                          {start ? `${start} – ${end}` : end}
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold">{pick(x.data.role, lang)}</h3>
                        <p className="text-mute">
                          {x.data.org}
                          {pick(x.data.place, lang) ? ` · ${pick(x.data.place, lang)}` : ""}
                        </p>
                        <p className="mt-3">{pick(x.data.summary, lang)}</p>
                        {bullets.length > 0 && (
                          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-fg/90 marker:text-accent2">
                            {bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </article>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </Section>
        )}

        {/* ------------------------------ projects ---------------------------- */}
        {projects.length > 0 && (
          <Section id="projects" title={t("sections.projects")}>
            <div className="grid gap-5 lg:grid-cols-2">
              {projects.map((pr, i) => (
                <Reveal key={pr.id} delay={i * 0.06}>
                  <article className="card flex h-full flex-col overflow-hidden">
                    {real(pr.data.image) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pr.data.image} alt="" loading="lazy" width={800} height={450} className="aspect-video w-full object-cover" />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-2xl font-semibold">{pick(pr.data.title, lang)}</h3>
                      <p className="mt-2 flex-1 text-mute">{pick(pr.data.summary, lang)}</p>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {(pr.data.tags ?? []).map((tag: string) => (
                          <li key={tag} className="chip">{tag}</li>
                        ))}
                      </ul>
                      <div className="mt-5 flex flex-wrap gap-4 text-sm">
                        {real(pr.data.url) && (
                          <a href={pr.data.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 text-accent hover:underline">
                            <Icon name="globe" size={16} /> {t("labels.live")}
                          </a>
                        )}
                        {real(pr.data.repo) && (
                          <a href={pr.data.repo} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 text-accent hover:underline">
                            <Icon name="code" size={16} /> {t("labels.code")}
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* ------------------------------- skills ----------------------------- */}
        {skills.length > 0 && (
          <Section id="skills" title={t("sections.skills")}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.05}>
                  <article className="card h-full p-6">
                    <h3 className="mb-4 text-2xl font-semibold">{pick(s.data.group, lang)}</h3>
                    <ul className="flex flex-wrap gap-2">
                      {(s.data.items ?? []).map((it: string) => (
                        <li key={it} className="chip text-fg/90">{it}</li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* ---------------------------- education ----------------------------- */}
        {(education.length > 0 || certs.length > 0) && (
          <Section id="education" title={t("sections.education")}>
            <div className="grid gap-5 md:grid-cols-2">
              {education.map((e) => {
                const years = [scrub(e.data.start || ""), scrub(e.data.end || "")].filter(Boolean).join(" – ");
                return (
                  <Reveal key={e.id}>
                    <article className="card h-full p-6">
                      {years && <p className="text-sm text-accent">{years}</p>}
                      <h3 className="mt-1 text-2xl font-semibold">{pick(e.data.degree, lang)}</h3>
                      <p className="text-mute">{e.data.school}</p>
                      {pick(e.data.note, lang) && <p className="mt-3">{pick(e.data.note, lang)}</p>}
                    </article>
                  </Reveal>
                );
              })}
            </div>
            {certs.length > 0 && (
              <Reveal className="mt-10">
                <h3 className="mb-4 text-2xl font-semibold text-accent2">{t("labels.certifications")}</h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {certs.map((c) => (
                    <li key={c.id} className="card flex items-center justify-between gap-3 p-4">
                      <span>
                        <span className="block font-medium">{pick(c.data.title, lang)}</span>
                        <span className="text-sm text-mute">
                          {[c.data.issuer, scrub(c.data.year || "")].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      {real(c.data.url) && (
                        <a href={c.data.url} target="_blank" rel="noopener noreferrer" aria-label={pick(c.data.title, lang)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-accent hover:border-accent">
                          <Icon name="link" size={18} />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </Section>
        )}

        {/* ------------------------------ gallery ----------------------------- */}
        {gallery.length > 0 && (
          <Section id="gallery" title={t("sections.gallery")}>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((g) => (
                <li key={g.id} className="overflow-hidden rounded-xl border border-line bg-panel">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.data.url} alt={pick(g.data.alt, lang)} loading="lazy" decoding="async" width={800} height={600} className="aspect-[4/3] w-full object-cover" />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ------------------------------ contact ----------------------------- */}
        <Section id="contact" title={t("sections.contact")}>
          <div className="grid gap-10 md:grid-cols-2">
            <Reveal>
              <p className="text-lg text-fg/90">{t("contact.intro")}</p>
              <p className="mt-8 text-sm uppercase tracking-widest text-mute">{t("contact.direct")}</p>
              <ul className="mt-3 space-y-1 text-lg">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="inline-flex min-h-[44px] items-center gap-2 hover:text-accent">
                      <Icon name="mail" size={18} /> {email}
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex min-h-[44px] items-center gap-2 hover:text-accent">
                      <Icon name="phone" size={18} /> {phone}
                    </a>
                  </li>
                )}
              </ul>
            </Reveal>
            <Reveal delay={0.08}>{flags.contactOpen ? <ContactForm /> : <p className="card p-6 text-mute">{t("contact.closed")}</p>}</Reveal>
          </div>
        </Section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-mute sm:flex-row">
          <p>
            © {new Date().getFullYear()} {name}. {t("footer.rights")}
          </p>
          <p className="flex items-center gap-4">
            <span>{t("footer.built")}</span>
            <a href="#top" className="inline-flex min-h-[44px] items-center hover:text-accent">
              {t("footer.top")}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
