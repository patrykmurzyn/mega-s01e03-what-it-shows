# Dates move by one day or disagree across time zones

**Reports covered: 5.** Source ticket: #4471. Status: **open**.

## Problem and evidence

These descriptions are not explained by swapping day and month. They are listed in the desk's original oneDayMove notes. A time-zone or day-boundary bug is a working hypothesis; the export does not establish the root cause of every description.

- **R-41202**, kettle.books, email, received 2026-04-02T10:41:00+02:00:
  > Invite says Tuesday 12 May. Calendar says Monday 11 May. My client turned up on the Monday. We had coffee.
- **R-41209**, alder.physio, app, received 2026-04-06T15:18:00+02:00:
  > Every booking in June is one day off. Only June. Why only June.
- **R-41236**, nine.lanterns, app, received 2026-04-20T11:52:00+02:00:
  > The invite arrived before I made the booking. I would like to know how.
- **R-41344**, pale.harbour, email, received 2026-06-12T09:58:00+01:00:
  > Client in Lisbon got Tuesday. Client in Toronto got Monday. Same meeting. We held it twice.
- **R-41620**, lantern.row, email, received 2026-10-04T21:49:00+02:00:
  > Tuesday 6 October showed as Monday. I moved it myself. I have stopped reporting these but my colleague says it helps you.

## Accounting

The supplied desk classifier files these five IDs under parser (379). They are a subset of that bucket, not five additional reports. A disjoint count is 374 parser, 33 hint and 5 one-day descriptions = 412 unique report IDs. Keep the original accounting visible while tracking this distinct unresolved problem.

## Why this remains open

[Engineering update](https://hq.mega.dev/challenges/what-it-shows), read 2026-10-28: #4471 closed 05 Oct. The parser was fixed by changing date field order; booking-v3 was retired. Neither ending reports a fix for one-day shifts or different days for the same meeting. Closing the parent is not evidence that these reports are resolved.

## Investigation and acceptance

Reproduce a date-only booking across Lisbon and Toronto, record the entered calendar date, stored representation and invitation in both zones, and check midnight/DST boundaries. Investigate the early-arriving invitation separately if it has another mechanism. Close only when a remedy or another evidence-backed disposition covers the observed reports.

[Signed review](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/src/routes/kb/reviews/4471/+page.svx) · [Rendered review](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/build/kb/reviews/4471/index.html) · [Full evidence](https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main/static/evidence/audit.json).
