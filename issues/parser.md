# Shared date parser swaps day and month for day-first tenants

**Reports covered: 379.** Source ticket: #4471. Classification: `parser`.

## Problem

The shared parser interprets every date month first. Affected tenants use day-first dates. This is separate from the booking-v3 form-hint defect.

## Reproduction from the supplied model

1. Use a day-first tenant, for example harbour.dental (en-GB, booking-v2), through the app path.
2. Enter 07/04/2026 intending 7 April 2026.
3. Follow the shared date parsing path described in src/lib/kb/causes.ts.
4. Month-first interpretation produces 4 July 2026. R-41200 reports that April/July swap.

These steps are grounded in the exported classifier and report examples; no production application is included, so a production reproduction or deployed fix has not been verified.

**Expected:** The parsed invite/reminder date preserves the tenant-intended calendar date.

**Actual:** Ambiguous day/month values can be swapped, sending an invite or reminder for another date.

## Scope and evidence

- Dataset: support-kb export dated 2026-10-04, reviewed 2026-10-28. This is a snapshot, not the live desk.
- 379 distinct report IDs; 11 tenants; first seen 2026-04-01; last seen 2026-10-04.
- Counted with the supplied uniqueById, tenant directory, causeOf and groupByCause. Overlapping export rows count once. Different IDs remain different reports, even if their words match.
- Intake tags in this group: parser: 356, hint: 23. Tags and browser locale are not the tenant's ground truth.
- Full membership: [CSV](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/static/evidence/reports-by-cause.csv) and [audit JSON](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/static/evidence/audit.json), group `parser`.

- **R-41200** — harbour.dental, app, en-GB, booking-v2; received 2026-04-01T09:12:00+01:00.
  > Our 7 April reminder went out on 4 July. Is this a joke. It is not April Fools where we are.
- **R-41201** — harbour.dental, app, en-GB, booking-v2; received 2026-04-01T09:34:00+01:00.
  > Sorry. 4 July went out on 7 April. I have been up since five.
- **R-41202** — kettle.books, email, nl-NL, booking-v2; received 2026-04-02T10:41:00+02:00.
  > Invite says Tuesday 12 May. Calendar says Monday 11 May. My client turned up on the Monday. We had coffee.

## Atypical descriptions and uncertainty

The desk flags 5 descriptions: R-41202, R-41209, R-41236, R-41344, R-41620. They remain in this classifier-derived count, including one-day-move and otherwise ambiguous wording. This accounting assignment does not establish a shared mechanism for each description. Reproduce and investigate them; track them separately in issue 3, which stays open. The parser fix is not evidence that these descriptions are resolved; their technical root cause is unconfirmed.

## Proposed repair and acceptance checks

Use an explicit tenant-aware input format, validate ambiguous input and carry an unambiguous date value through invites/reminders.

- Check a day-first tenant with an ambiguous date and an unambiguous date; verify stored date, invitation and reminder agree.
- Check a month-first tenant as a regression control; do not infer locale from the reporter's browser.
- Check the other defect independently; closing this ticket must not close the other mechanism by implication.
- Reconcile new reports and configuration changes against the ID manifest before updating coverage.

## Related documentation

[Signed incident review](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/src/routes/kb/reviews/4471/+page.svx), [rendered review](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/build/kb/reviews/4471/index.html), and [proposed replacement for subject-only triage](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx). No deployed fix has been verified.

## Engineering update and current outcome

[Course desk update](https://hq.mega.dev/challenges/what-it-shows), read 2026-10-28: #4471 closed 05 Oct. FIXED: engineering reports `fix(dates): parse dd/mm for eu locales`. Close as completed. Five one-day descriptions remain separately open in issue 3; the desk count includes them, but their resolution is not implied. This supersedes the earlier investigation-only closing explanation.
