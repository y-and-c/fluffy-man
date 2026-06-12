# Y&C marketing site

Two-page marketing site for **Y&C** — a web-design studio that works exclusively with Australian property businesses (real estate agencies, property managers, developers, construction firms). Built from the design handoff under `_handoff/` (gitignored).

**Stack:** Astro 6 (TypeScript strict) · Tailwind v4 · Resend · Vercel adapter.

## Getting started

```sh
npm install
cp .env.example .env       # then fill in Resend values
npm run dev                # http://localhost:4321
```

## Scripts

| Command            | What it does                                      |
| :----------------- | :------------------------------------------------ |
| `npm run dev`      | Dev server with HMR at `localhost:4321`           |
| `npm run build`    | Build to `.vercel/output/` (Vercel adapter)       |
| `npm run preview`  | Preview the built output locally                  |
| `npm run check`    | Astro + TypeScript diagnostics                    |

## Environment

Required for the `/api/enquiry` endpoint to actually send mail. Set locally via `.env`; in production via the Vercel project settings.

| Var                | Example                                  | Notes                                         |
| :----------------- | :--------------------------------------- | :-------------------------------------------- |
| `RESEND_API_KEY`   | `re_...`                                 | Create at <https://resend.com>                |
| `ENQUIRY_TO`       | `hello@yandc.com.au`                     | Inbox that receives enquiries                 |
| `ENQUIRY_FROM`     | `"Y&C Site <enquiries@yandc.com.au>"`    | Must be on a Resend-verified sending domain   |

Without these, the endpoint returns `500 { ok: false, error: "Enquiry endpoint is not configured." }` so the site still builds and the form can be exercised against validation.

## Project layout

```
src/
├── components/
│   ├── Footer.astro       # charcoal footer with brand wordmark
│   ├── Nav.astro          # sticky nav; variant: "home" | "contact"
│   └── Wordmark.astro     # inline Y&C SVG (currentColor)
├── layouts/
│   └── Site.astro         # <head>, fonts, Nav + slot + Footer
├── pages/
│   ├── api/
│   │   └── enquiry.ts     # POST → Resend (Vercel serverless function)
│   ├── contact.astro
│   └── index.astro
└── styles/
    └── global.css         # Tailwind + design tokens (@theme + :root vars)

public/
├── brand/
│   ├── yc-ampersand.svg
│   └── yc-wordmark.svg
└── favicon.{ico,svg}      # placeholders — swap to Y&C favicon pre-launch

_handoff/                  # gitignored — original design references
```

## Deploy

Connect this repo to a Vercel project via <https://vercel.com/new>. Astro auto-detects the `@astrojs/vercel` adapter. Add the three env vars above in the Vercel project settings. The two pages prerender to static HTML; only `/api/enquiry` runs as a serverless function.

## What's next (follow-up pass)

The current scaffold lays the foundation — tokens, layout, nav, footer, and the working enquiry endpoint. The full section build (`<Services>`, `<WhyYC>`, `<Faqs>`, `<FinalCta>`, `<ContactIntro>`, `<EnquiryForm>`) maps 1:1 onto sections in the handoff README and lands in the next pass. See `_handoff/design_handoff_yc_property_site/README.md` for the canonical spec.
