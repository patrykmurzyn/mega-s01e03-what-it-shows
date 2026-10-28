# Booking-v3 date hint conflicts with tenant-local date parsing

**Reports covered: 33.** Source ticket: #4471. Classification: `hint`.

## Problem

The booking-v3 date field prints MM/DD/YYYY, while the form interprets input in the day-first tenant convention. A user following the hint enters a date the form then interprets differently. This is separate from the shared parser defect.

## Reproduction from the supplied model

1. Use copper.studio (es-ES, booking-v3) through the form channel.
2. Follow the visible MM/DD/YYYY hint and enter 01/06/2026 intending 6 January 2026.
3. The day-first form interpretation produces 1 June 2026. R-41230 reports 1 June instead of 6 January.
4. Compare the same tenant through app/email: the supplied classifier assigns that path to parser, not hint.

These steps are grounded in the exported classifier and report examples; no production application is included, so a production reproduction or deployed fix has not been verified.

**Expected:** The printed hint, validation and date interpretation agree on one tenant-aware convention.

**Actual:** Following the booking-v3 hint can swap day and month before the booking is created.

## Scope and evidence

- Dataset: support-kb export dated 2026-10-04, reviewed 2026-10-28. This is a snapshot, not the live desk.
- 33 distinct report IDs; 3 tenants; first seen 2026-04-17; last seen 2026-09-22.
- Counted with the supplied uniqueById, tenant directory, causeOf and groupByCause. Overlapping export rows count once. Different IDs remain different reports, even if their words match.
- Intake tags in this group: parser: 15, hint: 18. Tags and browser locale are not the tenant's ground truth.
- Full membership: [CSV](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/static/evidence/reports-by-cause.csv) and [audit JSON](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/static/evidence/audit.json), group `hint`.

- **R-41230** — copper.studio, form, es-ES, booking-v3; received 2026-04-17T22:44:00+02:00.
  > My client came on 1 June instead of 6 January. We sorted it out.
- **R-41241** — alder.physio, form, de-DE, booking-v3; received 2026-04-21T19:21:00+02:00.
  > We had two people show up on 8 June. They were booked for 6 August.
- **R-41251** — pale.harbour, form, pt-PT, booking-v3; received 2026-04-25T20:48:00+01:00.
  > Wednesday 7 January showed as Wednesday 1 July. I moved it myself.

## Proposed repair and acceptance checks

Generate the hint and validation from the same convention used to interpret the form. Check booking-v2, booking-v3 and non-form paths independently.

- Check a day-first tenant with an ambiguous date and an unambiguous date; verify stored date, invitation and reminder agree.
- Check a month-first tenant as a regression control; do not infer locale from the reporter's browser.
- Check the other defect independently; closing this ticket must not close the other mechanism by implication.
- Reconcile new reports and configuration changes against the ID manifest before updating coverage.

## Related documentation

[Signed incident review](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/src/routes/kb/reviews/4471/+page.svx), [rendered review](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/build/kb/reviews/4471/index.html), and [proposed replacement for subject-only triage](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx). No deployed fix has been verified.

## Engineering update and current outcome

[Course desk update](https://hq.mega.dev/challenges/what-it-shows), read 2026-10-28: #4471 closed 05 Oct. WON’T FIX: engineering retired the booking-v3 form. Close as not planned; this is retirement, not a verified hint repair. This supersedes the earlier investigation-only closing explanation.
