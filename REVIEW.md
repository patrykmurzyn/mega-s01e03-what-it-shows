# #4471 — submission review

Prepared for MEGA.dev's **what it shows** Challenge. Owner and signature: Patryk Murzyn.

| Confirmed mechanism in the exported model | Distinct reports | Issue draft |
| --- | ---: | --- |
| Shared parser reads month first for day-first tenants | 379 | [parser](issues/parser.md) |
| Booking-v3 hint disagrees with tenant-local form parsing | 33 | [hint](issues/hint.md) |

All 412 distinct IDs are accounted for once. The 427 export rows contain 15 identical extra copies. Thirty-eight intake labels differ from the tenant-aware result. Five atypical descriptions remain explicitly flagged for investigation; the supplied classifier assigns them to parser. These are snapshot results, not proof of a deployed repair or current support state.

## Read the page

- [Signed SVX source](src/routes/kb/reviews/4471/+page.svx)
- [Actual rendered HTML](build/kb/reviews/4471/index.html), including component output, styles, client logic and desk ref
- [Proposed decision 0002](src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx); accepted decision 0001 is preserved
- [Complete report membership](static/evidence/reports-by-cause.csv)
- [Audit, duplicate row positions and exceptions](static/evidence/audit.json)

The HTML can be downloaded and opened directly for its embedded content and interactions. To follow the kb's absolute internal links and download evidence, serve the full build folder. GitHub's file viewer shows HTML source rather than hosting the page.

## Reproduce

Validated with Node.js 25.9.0. Dependencies are pinned in package-lock.json.

```sh
npm ci
npm run audit
npm run build
npm run preview -- --port 4173
```

Open `http://127.0.0.1:4173/kb/reviews/4471/`. Build output is in `build/`. The build uses the original exported Svelte components and mdsvex; the rendered findings are not manually substituted for component output. A `#lib` package import maps the export's imports to the local source tree.

`npm run audit` checks the partition, duplicate conflicts, monthly reconciliation and context-dependent classification, regenerates the evidence files, and regenerates both issue drafts from the same dataset. The issue-draft links target the proposed repository `patrykmurzyn/mega-s01e03-what-it-shows`; change that base in tools/audit.mjs and rerun if another repository is chosen.

## What is preserved and what changed

The original export is dated 2026-10-04. All supplied pages, data, cause logic and components are preserved. Additions are the signed review, proposed decision 0002, ReviewEvidence component, review calculations, audit and evidence, issue drafts, build configuration and rendered build. README.md has a new navigation section above the original export README.

The original incident still says one known issue. This historical wording is deliberately not presented as the current result: the new review explains how it conflicts with the existing rendered table. No accepted decision was rewritten.

## Limits and publication state

The production app, its date parser implementation and any deployment state are absent. Reproduction steps follow the exported model and report examples. Fixes are proposals. Source counts must be recomputed if a new export or tenant configuration arrives.

This directory is ready for review. As of preparation, it has not been made a GitHub repository, pushed, or submitted to the course. Publish only after the student approves the named public repository and the push/issues operations. Once authorized, publish the two issue drafts as GitHub issues; Markdown files alone do not satisfy the Challenge's ticket requirement.
