import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = {
  name: 200,
  email: 320,
  company: 200,
  message: 5000,
  topics: 12,
  topic: 80,
};

type Payload = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  message?: unknown;
  topics?: unknown;
};

function fail(status: number, error: string) {
  return new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return fail(400, "Invalid JSON body.");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const topicsRaw = Array.isArray(body.topics) ? body.topics : [];
  const topics = topicsRaw
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length <= MAX_LEN.topic)
    .slice(0, MAX_LEN.topics);

  if (!name || name.length > MAX_LEN.name) return fail(400, "Please enter your name.");
  if (!email) return fail(400, "Please enter your email.");
  if (email.length > MAX_LEN.email || !EMAIL_RE.test(email))
    return fail(400, "Please enter a valid email address.");
  if (!message || message.length > MAX_LEN.message)
    return fail(400, "Please add a short message.");
  if (company.length > MAX_LEN.company) return fail(400, "Company name is too long.");

  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.ENQUIRY_TO;
  const from = import.meta.env.ENQUIRY_FROM;

  if (!apiKey || !to || !from) {
    console.error("[enquiry] Missing env: RESEND_API_KEY / ENQUIRY_TO / ENQUIRY_FROM");
    return fail(500, "Enquiry endpoint is not configured.");
  }

  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  const nl = (s: string) => esc(s).replace(/\n/g, "<br>");

  const html = `
    <h2>New enquiry — ${esc(name)}</h2>
    <p><strong>Email:</strong> ${esc(email)}</p>
    ${company ? `<p><strong>Company:</strong> ${esc(company)}</p>` : ""}
    ${topics.length ? `<p><strong>Looking for:</strong> ${topics.map(esc).join(", ")}</p>` : ""}
    <p><strong>Message:</strong></p>
    <p>${nl(message)}</p>
  `;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `New enquiry — ${name}`,
      html,
    });
    if (error) {
      console.error("[enquiry] Resend error:", error);
      return fail(502, "Could not send your message. Please try again.");
    }
  } catch (err) {
    console.error("[enquiry] Unexpected error:", err);
    return fail(500, "Something went wrong. Please try again.");
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
