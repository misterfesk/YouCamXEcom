# [BRAND]

A skincare store that rearranges the shelf around your skin, with a reason behind every match.

An optional YouCam scan identifies visible concerns and provides a Fitzpatrick estimate. Concern-specific bands become everyday goals; the full catalog is then ranked by relevance, skin type, ingredient cautions and sun-protection considerations. Five fit levels explain the result on cards and product pages. Recommendations can be changed or switched off, and every product stays available.

The 60 products, formulas and prices are fictional. Checkout is a demo: no order or payment is taken. A scan provides guidance, not a medical diagnosis. The concern bands are provisional, based on three recorded sample faces rather than clinical validation.

Live demo: [LIVE_URL]

## Try the complete journey

1. Open the scan dialog and choose **Try with a sample face**. No account, personal photo or live credits are needed.
2. Choose **Breakouts & oil**, inspect the reveal and tap a different goal to change its concern overlay.
3. Continue to **For you**. Watch the catalog reorder, inspect fit badges and open a product.
4. Expand **Why it suits you**, add it to the bag and continue to demo checkout.
5. Optionally enter a first name/email, acknowledge the demo and place a demo order. No payment is collected.
6. Use the profile menu to turn recommendations off, reopen the results or delete browser results.

Sample faces replay recorded YouCam results. They remain available when live scanning is paused, so repeated judging and testing should use samples. A real camera check still needs a supported device; camera access requires HTTPS or localhost.

## How YouCam changes the shopping experience

Skin Analysis SD supplies visible-concern scores and masks. Fitzpatrick Scale Analyzer adds an image-based estimate for sun-sensitivity guidance. The browser uploads a resized JPEG directly to YouCam; server routes start both analyses in parallel and return normalized results through a signed polling token. The JS Camera Kit supplies live framing checks and capture when the shopper chooses a camera.

The analysis drives the whole store: category and concern sorting, fit badges, product explanations, search and the bag. The ranking includes cautions as well as relevance; it does not promise product outcomes or hide the rest of the collection.

## Architecture

Next.js 16 App Router and TypeScript serve the storefront and scan routes. Typed components render from props. A static catalog and explicit ingredient rules feed client-side ranking; Zustand holds derived profile and bag state. Upstash Redis shares limits and a durable credit ledger across server instances, plus a temporary derived-score cache. Standalone output supports Docker; mock/live mode is read at runtime.

## Run locally

Use Node.js 24 and pnpm 12.14.0.

```bash
npm install -g pnpm@12.14.0
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

On PowerShell, use `Copy-Item .env.example .env`. Open http://localhost:3000. The default `YOUCAM_MODE=mock` needs no API key. Use `YOUCAM_MOCK_SCENARIO=face_too_small`, `too_dark`, `unavailable` or `slow` to exercise provider outcomes; restart the server after changing environment settings. Mock photo uploads still run validation, upload, task and polling stages, but return recorded results.

For a production run:

```bash
pnpm build
pnpm start
```

The start command prepares public/static assets and launches the standalone server. Set `SITE_URL` to the canonical public origin before building for deployment; metadata and the sitemap use that origin. The UI brand name is defined once in `src/config/site.ts`.

## Docker

```bash
docker compose up --build
```

Compose defaults to mock mode without an `.env`. The multi-stage image runs as a non-root user and contains the standalone server and its public/static assets. Environment files and private local material are excluded from the build context. Building needs network access for packages and fonts.

The same image can run mock or live. Set the runtime environment, then recreate the container. Compose configuration has been validated and standalone output has been tested directly in both modes; container execution still needs verification on a running Docker engine.

## Live configuration and credits

Set these server-only variables before enabling live mode:

| Variable | Purpose |
|---|---|
| `YOUCAM_MODE=live` | Explicitly enable live analysis; other values stay mock. |
| `YOUCAM_API_KEY` | Your YouCam account key. |
| `SCAN_TOKEN_SECRET` | A stable random signing value, at least 32 characters. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Persistent shared counters, budget and result cache. |
| `SCAN_CAP_PER_IP`, `SCAN_CAP_GLOBAL` | Allowed starts per visitor and globally, per UTC day. |
| `CREDIT_RESERVE_FLOOR`, `RESERVE_RELEASE_AT` | Credit units held until the reserve-release timestamp. |
| `SITE_URL` | Canonical public origin, set before the build. |

All variables and optional overrides are commented in `.env.example`. Never use a `NEXT_PUBLIC_` prefix for credentials. Keep preview deployments in mock mode. Vercel and other multi-instance deployments require Upstash; never use `SCAN_STORE=memory` there. One persistent local container can opt into memory storage, but a restart resets its counters and budget.

A full scan uses 26 units. Task creation is never automatically retried. Both UTC daily caps and atomic reservations protect the credit reserve under concurrency; ambiguous or partially started tasks keep their units held. Limits and provider failures show a friendly pause with sample faces.

The Redis budget and spent keys are permanent. Preserve them across deploys and use one exclusive credit pool: other live applications or independent deployment namespaces must not spend the same allocation. The ledger deliberately does not add top-ups or release uncertain charges automatically. Recalibration requires scans to be paused and all requests finished; never delete active budget keys. For judging, configure the deployment's measured balance, hold at least half for judges and spread the reserved full scans over the judging window.

## Privacy

The browser checks and re-encodes photos, then uploads directly to YouCam. Our server does not receive or save live selfie bytes, and photos are never written to browser storage. Closing the scan aborts browser work and discards its preview. YouCam processes uploads under its own terms; this application does not claim control of the provider's retention.

In the browser, derived scores persist only after the shopper continues; delete them from the skin menu. Live mask URLs are excluded from browser persistence. The server also caches derived scores without masks for 24 hours, keyed by a salted visitor hash and photo hash, to avoid repeat analysis. Deleting browser results does not clear that temporary server cache. Sample photos and recorded sample responses are public demonstration assets.

## Checks and screenshots

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

The browser suite starts a production server in mock mode. Build first and keep port 3000 free. Tests cover the sample-to-order keyboard journey, optional recommendations, mock upload outcomes, photo cleanup, accessibility, touch targets, HTTP 404s, metadata and responsive images.

With a mock production server running, `pnpm submission:shots <output-directory>` captures reveal, personalized catalog and product reasoning at 1440 and 390 pixels. It never requests live scan APIs. `pnpm shots <output-directory> <route>` captures full pages at 1440, 768 and 390.

Code is licensed under MIT. Fonts retain their own licenses; image provenance is recorded in `public/images/IMAGES.md`, and Archivo's license is in `src/styles/fonts/OFL.txt`.
