# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Locked Product Direction

- The final visual source is the third revised Option 3 mock: warm ivory canvas, charcoal navigation, deep green actions, amber warnings, editorial serif headings, and highly readable sans-serif UI text.
- The prototype is a French-first, Tunisia-localized, white-label sales and enrollment operating system for private training centers, not a CRM or ERP.
- All visible metrics must derive from one shared synthetic candidate dataset.
- The golden path runs from a public program inquiry through contact, document collection, readiness, and confirmed registration.
- Integrations are simulated honestly: WhatsApp opens a composer preview and records a simulated activity; payments are described as modalities, not a gateway.
- At narrower desktop widths the candidate panel behaves as a drawer and navigation may collapse.
- Phone access is a required sales-demo flow: never replace admissions with a desktop-only notice. Keep all admissions sections reachable, show candidate cards at phone widths, and keep dossier controls, forms and the simulated WhatsApp composer readable and operable from 320 px upward. Preserve the desktop visual direction.

## Approved audit corrections — 2026-09-22

The user approved the audit's simplified scope. This supersedes the former mandatory document/readiness pipeline above. Preserve the green/ivory/charcoal visual identity. Use four statuses (Nouveau, En échange, Inscrit, Sans suite), editable notes, one actionable open reminder per inquiry, a shared editable catalogue, filtered CSV export and task-focused counts. Remove fictional testimonials/statistics, financial pipeline and mandatory documents from the standard demo. Public view is the default. Phone navigation goes at the bottom; tablet uses a readable master/detail layout when it fits. Persist synthetic demo data locally and label simulations honestly. Production services are outside this correction pass. Verify before handoff and do not republish until approval.

## General demo scope — 2026-09-28
- Retain the four admissions statuses and the existing ivory/green design.
- Add a fixed-layout content editor (Site): identity, contact, local image imports, home copy, three approach points and FAQ. No page builder.
- Catalogue supports draft/open/closed/archive and optional programme objectives, prerequisites and session date. Archive preserves requests.
- Keep website edits and admissions in the same local store, preserve existing schema-3 records and detect stale content versions.
- Demo only: no real messaging, authentication or shared production database.
- UI checked in browser: content changes, FAQ addition, programme creation, preselection/submission, notes, contact outcome, registration and updated counters; CSV generation toast observed. Native date filling/download event could not be confirmed by browser automation; date conversion/reminder rules/CSV contents passed unit tests.
- Responsive editor measured at 360/390/768/1440; public content has no horizontal page overflow at those frame widths.
