# YouCamXEcom

A skincare store that re-sorts itself around your skin. An optional selfie scan (YouCam Skin Analysis + Fitzpatrick) finds your top skin concerns, then every product is ranked and labeled by how well it fits you.

Work in progress.

## Run locally

```bash
pnpm install
cp .env.example .env   # mock mode works without an API key
pnpm dev
```

Use Node.js 24 and pnpm 12.14.0. Install pnpm with `npm install -g pnpm@12.14.0` if needed.
For production checks, run `pnpm build` then `pnpm start`. Run `pnpm e2e` only after a mock production build; it starts its own production server.

## Docker

```bash
docker compose up --build
```

Open http://localhost:3000. Without an `.env`, Compose runs in mock mode and needs no API key.
The image runs as a non-root user and contains only the standalone server and public/static assets.
Builds need network access for dependencies and fonts. No secrets enter the build context.

The same image supports mock and live at runtime. To enable live analysis, set `YOUCAM_MODE=live`, `YOUCAM_API_KEY`, a random `SCAN_TOKEN_SECRET` of at least 32 characters, and both Upstash REST variables in `.env`, then recreate the container. Use the exact variables documented in `.env.example`. A single persistent container can use `SCAN_STORE=memory`; its counters reset on restart, so use Upstash for judging and all multi-instance/serverless deployments. Never expose these variables with a `NEXT_PUBLIC_` prefix.

Live task creation is never retried automatically. Both daily caps and a permanent credit ledger protect the reserve; use a dedicated credit pool and leave preview deployments in mock mode. Preserve the Redis budget/spent keys across deploys. Ambiguous charges remain held, and top-ups are not automatically added to the budget.
