# #4471 — submission review

Prepared for MEGA.dev's **what it shows** Challenge. Owner: Patryk Murzyn. The added pages carry the exact page signature issued by the course; RenderStamp derives the desk reference from it.

| Confirmed mechanism in the exported model | Distinct reports | Issue draft |
| --- | ---: | --- |
| Shared parser reads month first for day-first tenants | 379 | [parser](issues/parser.md) |
| Booking-v3 hint disagrees with tenant-local form parsing | 33 | [hint](issues/hint.md) |

All 412 distinct IDs are accounted for once. The 427 export rows contain 15 identical extra copies. Thirty-eight intake labels differ from the tenant-aware result. Five one-day descriptions remain open in issue 3; the supplied classifier includes them in parser. Disjoint problem accounting is 374 + 33 + 5 = 412.

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

`npm run audit` checks the partition, duplicate conflicts, monthly reconciliation and context-dependent classification, regenerates the evidence files, and regenerates all three issue drafts from the same dataset. The issue-draft links target the proposed repository `patrykmurzyn/mega-s01e03-what-it-shows`; change that base in tools/audit.mjs and rerun if another repository is chosen.

## What is preserved and what changed

The original export is dated 2026-10-04. All supplied pages, data, cause logic and components are preserved. Additions are the signed review, proposed decision 0002, ReviewEvidence component, review calculations, audit and evidence, issue drafts, build configuration and rendered build. README.md has a new navigation section above the original export README.

The original incident still says one known issue. This historical wording is deliberately not presented as the current result: the new review explains how it conflicts with the existing rendered table. No accepted decision was rewritten.

## Limits and publication state

The production app, its date parser implementation and any deployment state are absent. Reproduction steps follow the exported model and report examples. The course engineering update reports the parser fixed and booking-v3 retired; no independent production test was performed. Source counts must be recomputed if a new export or tenant configuration arrives.

Published with the student's approval in [patrykmurzyn/mega-s01e03-what-it-shows](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows). The actual tickets are [parser, issue 1](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/issues/1) and [booking-v3 hint, issue 2](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/issues/2). The Markdown files preserve their submitted bodies. The course accepted the solution on 2026-10-28 at 22:40 UTC. [Debrief](https://hq.mega.dev/challenges/what-it-shows#debrief).

The engineering update on the Challenge page (read 2026-10-28) says #4471 closed 05 Oct: parser FIXED (`fix(dates): parse dd/mm for eu locales`), hint WON’T FIX (`booking-v3 form retired`). Issue 1 is completed; issue 2 is not planned. [Issue 3](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/issues/3), covering the five one-day descriptions, remains open because neither ending reports their resolution. This supersedes our earlier explanation that closing meant only finishing the investigation.
