# Cloudflare Migration Assessment — MoSaFa Tools

Repository: `anikvaii700/All_Tools`
Source branch: `main`
Assessment branch: `chore/cloudflare-migration-assessment`

## Status

This is an assessment and safe migration plan only. No production code, Render service, DNS record, Firebase project, or user data has been changed. Do not merge this document as if it were a completed migration.

## Current architecture confirmed from source

- Frontend: React 19 + Vite.
- Build: `vite build && tsx scripts/generate-seo-pages.ts`.
- Runtime: Node.js + Express in `server.ts`.
- AI: Google GenAI SDK, configured with `GEMINI_API_KEY`.
- Identity: Firebase Authentication; backend uses Firebase Admin SDK for privileged token verification.
- Database: Firebase Firestore is used by the client and some backend-related flows.
- Persistent server-side data: `server/shopStore.ts` and `server/cvHelperRoutes.ts` read and write JSON files beneath `.data`.
- Server also serves static assets and MediaPipe WASM files, provides API endpoints, and includes streaming responses (SSE) for StudyMate.

## Main migration blockers

1. **Express runtime:** Cloudflare Pages is suitable for the built frontend, not for running this Express server as-is. API routes need a deliberate Workers-compatible implementation or a separately hosted Node runtime.
2. **Local JSON persistence:** Workers instances do not provide a durable local filesystem. Shop profiles, collections, branding assets, CV helper profiles, and saved CVs currently use files under `.data`. These must be migrated to durable storage before switching traffic.
3. **Firebase Admin SDK:** Current admin verification relies on Firebase Admin. The SDK/runtime combination must be reviewed before choosing a Workers implementation. Do not weaken admin authorization or accept unverified tokens as a shortcut.
4. **Streaming:** StudyMate supports Server-Sent Events. The replacement must preserve streaming, response headers, disconnect handling, and error behavior.
5. **Uploads and size limits:** The Express JSON parser allows payloads up to 25 MB; shop branding images have their own size checks. Workers request limits and storage limits must be checked and adjusted safely.
6. **SEO generation:** The existing build generates SEO pages. Confirm generated output paths and Cloudflare Pages build artifact configuration before cutover.
7. **Secrets:** Gemini and Firebase service credentials must remain server-side secrets. Never commit keys or service-account JSON to Git.

## Recommended target architecture

- **Cloudflare Pages:** Serve the Vite-generated frontend and generated SEO/static pages.
- **Cloudflare Workers:** Host API routes only after they have been ported and tested. Use a Workers-compatible router (for example Hono) rather than attempting to run the existing Express server unchanged.
- **Durable storage:** Keep Firebase Auth as the identity provider. Migrate backend-owned shop/CV JSON records to Firestore (preferred if existing project rules and indexes support the data model) or a deliberately designed D1/R2 combination. Use R2 for binary/file assets if assets are moved out of Firestore. Do not use Workers KV for transactional shop records or private CV records.
- **Gemini:** Call Gemini from the Worker using a server-side secret and a Workers-compatible fetch-based client/API.
- **Custom domain:** Attach `tools.mosafabd.com` only after the Pages frontend and API have passed staging tests. Keep Render live until then.

## Required migration phases

### Phase 0 — Inventory and backup
- Identify all API routes and client references.
- Inventory every read/write path beneath `.data`, including shop and CV helper stores.
- Determine whether any production records currently exist on Render's ephemeral filesystem.
- Export and verify a backup before moving persistent data.
- Inventory environment variables without printing their secret values.

### Phase 1 — Storage design
- Define Firestore collections and document IDs for shop profiles, collections, assets, CV profiles, and saved CVs.
- Preserve tenant isolation: every shop record remains scoped to the authenticated UID/shop ID.
- Preserve private CV library authorization.
- Decide whether image assets remain in Firestore or move to R2; document size and access controls.
- Add a migration/import script with idempotency and validation; never overwrite destination records blindly.

### Phase 2 — API port
- Port routes in small groups.
- Preserve status codes, validation, error messages, authorization checks, CORS policy, and SSE behavior.
- Reimplement admin verification with cryptographic verification and explicit issuer/audience/expiry checks, or use a supported trusted verification service. Never remove revocation/admin checks silently.
- Keep Gemini secrets in Worker environment bindings.

### Phase 3 — Frontend and preview
- Configure Pages build command and output directory based on actual Vite/SEO output.
- Route API requests to the Worker without breaking existing URLs.
- Test every tool route, generated SEO route, sitemap, robots.txt, manifest, service worker, and static WASM assets.

### Phase 4 — Staging verification
- Test anonymous pages and all public tools.
- Test Firebase signup/login/logout and expired/invalid token behavior.
- Test admin allow/deny cases.
- Test shop bootstrap, profile, assets, collection CRUD, and cross-tenant isolation.
- Test CV helper generation, private library, saved CV CRUD, and file handling.
- Test Gemini errors, quota handling, and StudyMate SSE streaming.
- Run TypeScript checks, production build, and automated tests.

### Phase 5 — Cutover and rollback
- Only after successful staging and verified data import, attach the custom domain.
- Keep Render deployment and data backup intact during a rollback window.
- Monitor API errors and usage limits.
- Decommission Render only after the new deployment is stable and the owner approves.

## Immediate next implementation task

Complete a source-level inventory of:
1. all `app.get/app.post/app.put/app.delete/app.use` routes in `server.ts`;
2. all filesystem reads/writes in `server/shopStore.ts` and `server/cvHelperRoutes.ts`;
3. frontend API base URLs and environment variables;
4. generated SEO output directory.

No production code should be changed until this inventory and a durable data migration plan are complete.
