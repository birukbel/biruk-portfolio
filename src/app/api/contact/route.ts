import { db, t } from "@/db";
import { bad, handler, ok } from "@/lib/api";
import { getContent } from "@/lib/content";
import { contactSchema } from "@/lib/kinds";
import { clientIp, hit } from "@/lib/rate-limit";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const POST = handler(async (req: Request) => {
  const input = contactSchema.parse(await req.json());
  if (input.website) return ok(); // honeypot: pretend success, store nothing

  const { flags } = await getContent();
  if (!flags.contactOpen) return bad("The contact form is closed", 403);

  let gate;
  try {
    gate = await hit("contact", clientIp(req), 3, 60 * 60 * 1000);
  } catch {
    return bad("Service unavailable, please email me directly", 503);
  }
  if (!gate.allowed) return bad("Too many messages. Please try again later.", 429);

  await db().insert(t.messages).values({ name: input.name, email: input.email, body: input.body });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (key && to) {
    // Best-effort: a failed email must never fail the visitor's submission.
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: input.email,
        subject: `Portfolio message from ${input.name.slice(0, 80)}`,
        html: `<p><b>${esc(input.name)}</b> &lt;${esc(input.email)}&gt;</p><p>${esc(input.body).replace(/\n/g, "<br>")}</p>`,
      }),
    }).catch((e) => console.error("[resend]", e));
  }
  return ok();
});
