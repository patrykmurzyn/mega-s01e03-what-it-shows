# what it shows — #4471 review

This is a working copy of the support kb export with a signed incident review.

- **379 parser reports; 33 form-hint reports**, computed by the original cause logic after ID deduplication.
- [Review and reproduction guide](REVIEW.md)
- [Signed page source](src/routes/kb/reviews/4471/+page.svx) · [rendered page](build/kb/reviews/4471/index.html)
- [Parser issue draft](issues/parser.md) · [form-hint issue draft](issues/hint.md)
- [Report ID manifest](static/evidence/reports-by-cause.csv) · [audit](static/evidence/audit.json)

The export is a 2026-10-04 snapshot; review date is 2026-10-28. No live state or production fix is claimed.

---

# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.
