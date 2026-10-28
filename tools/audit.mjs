import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { review } from '../src/lib/kb/review.ts';
import { causeOf, sameCause } from '../src/lib/kb/causes.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const dataRoot = new URL('../src/lib/data/', import.meta.url);
const bytes = readFileSync(new URL('reports-4471.json', dataRoot));
const raw = JSON.parse(bytes);
const tenants = new Map(readdirSync(new URL('tenants/', dataRoot)).map(name => {
  const tenant = JSON.parse(readFileSync(new URL(`tenants/${name}`, dataRoot)));
  return [tenant.handle, tenant];
}));
const tenantOf = r => tenants.get(r.tenant);
const notes = JSON.parse(readFileSync(new URL('desk-notes.json', dataRoot)));
const result = review(raw, tenantOf, notes.oneDayMove);
const ids = result.groups.flatMap(g => g.reports.map(r => r.id));
assert.equal(ids.length, result.reports.length);
assert.equal(new Set(ids).size, result.reports.length);
assert.equal(result.groups.reduce((n, g) => n + g.reports.length, 0), result.reports.length);
assert.equal(result.months.reduce((n, m) => n + m.received, 0), result.reports.length);
assert.equal(result.months.reduce((n, m) => n + m.merged, 0), result.reports.length);
assert.ok(raw.every(r => r.mergedInto === 4471));
// Perturb misleading fields: classification must keep following tenant/channel.
for (const r of result.reports) {
  const changed = { ...r, subject: 'An unrelated subject', meta: { intakeTag: 'wrong', browserLocale: 'en-US' } };
  assert.equal(causeOf(r, tenantOf(r)), causeOf(changed, tenantOf(r)));
}
const form = { channel: 'form' }, app = { channel: 'app' };
assert.equal(sameCause(form, tenants.get('alder.physio'), app, tenants.get('alder.physio')), false);
assert.equal(sameCause(app, tenants.get('kettle.books'), { channel: 'email' }, tenants.get('kettle.books')), true);
assert.equal(causeOf(form, undefined), null);
assert.throws(() => review([raw[0], { ...raw[0], body: 'conflicting copy' }], tenantOf, []), /Conflicting/);

const rowPositions = new Map();
raw.forEach((r, index) => {
  if (!rowPositions.has(r.id)) rowPositions.set(r.id, []);
  rowPositions.get(r.id).push(index + 1);
});
const signedPage = readFileSync(new URL('../src/routes/kb/reviews/4471/+page.svx', import.meta.url), 'utf8');
const signature = signedPage.match(/^signature: '([^']+)'$/m)?.[1];
assert.ok(signature, 'The page must carry the exact signature issued by start-challenge');
const audit = {
  source: 'support-kb export, 2026-10-04', reviewed: '2026-10-28', author: 'Patryk Murzyn', deskRef: deskRef(signature),
  reportsSha256: createHash('sha256').update(bytes).digest('hex'),
  rawCount: result.rawCount, uniqueCount: result.reports.length, duplicateCopies: result.duplicates.length,
  duplicates: [...rowPositions].filter(([, positions]) => positions.length > 1).map(([id, rows]) => ({ id, sourceRowsOneBased: rows, identical: true })),
  groups: result.groups.map(({ reports, ...group }) => ({ ...group, count: reports.length, reportIds: reports.map(r => r.id) })),
  tagMismatches: result.mismatch.map(r => ({ id: r.id, intakeTag: r.meta.intakeTag, cause: causeOf(r, tenantOf(r)) })),
  atypicalReports: result.atypical.map(r => ({ id: r.id, body: r.body, assignedCause: causeOf(r, tenantOf(r)), diagnosticStatus: 'open in issue 3; technical root cause unconfirmed; not covered by parser fix or form retirement' })),
  problemPartition: { parser: result.groups.find(g => g.cause === 'parser').reports.filter(r => !notes.oneDayMove.includes(r.id)).map(r => r.id), hint: result.groups.find(g => g.cause === 'hint').reports.map(r => r.id), oneDayMove: result.atypical.map(r => r.id) },
  engineeringUpdate: { source: 'https://hq.mega.dev/challenges/what-it-shows', readOn: '2026-10-28', parentClosedOn: '2026-10-05', parser: 'fixed: fix(dates): parse dd/mm for eu locales', hint: 'wont_fix: booking-v3 form retired', oneDayMove: 'open; no reported remedy' },
  firstSeen: result.firstSeen, lastSeen: result.lastSeen, firstMerged: result.firstMerged,
  busiestMerge: result.busiestMerge, months: result.months,
  checks: ['unique-ID coverage', 'no conflicting copies', 'group partition', 'monthly reconciliation', 'misleading-field perturbation', 'same-subject different-cause case', 'different-channel same-cause case', 'unknown-tenant case', 'conflicting-copy rejection', 'problem partition coverage', 'problem partition uniqueness', 'one-day subset accounting']
};
const out = new URL('../static/evidence/', import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL('audit.json', out), JSON.stringify(audit, null, 2) + '\n');
const csv = value => `"${String(value).replaceAll('"', '""')}"`;
const rows = [['id', 'cause', 'tenant', 'tenantLocale', 'form', 'channel', 'intakeTag', 'receivedAt', 'mergedAt', 'sourceRowsOneBased']];
for (const r of result.reports) {
  const t = tenantOf(r);
  rows.push([r.id, causeOf(r, t), r.tenant, t.locale, t.form, r.channel, r.meta.intakeTag, r.receivedAt, r.mergedAt, rowPositions.get(r.id).join(';')]);
}
writeFileSync(new URL('reports-by-cause.csv', out), rows.map(row => row.map(csv).join(',')).join('\n') + '\n');

const issueDir = new URL('../issues/', import.meta.url);
mkdirSync(issueDir, { recursive: true });
const githubBase = 'https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/blob/main';
for (const group of result.groups) {
  const parser = group.cause === 'parser';
  const title = parser ? 'Shared date parser swaps day and month for day-first tenants' : 'Booking-v3 date hint conflicts with tenant-local date parsing';
  const mechanism = parser
    ? 'The shared parser interprets every date month first. Affected tenants use day-first dates. This is separate from the booking-v3 form-hint defect.'
    : 'The booking-v3 date field prints MM/DD/YYYY, while the form interprets input in the day-first tenant convention. A user following the hint enters a date the form then interprets differently. This is separate from the shared parser defect.';
  const steps = parser
    ? '1. Use a day-first tenant, for example harbour.dental (en-GB, booking-v2), through the app path.\n2. Enter 07/04/2026 intending 7 April 2026.\n3. Follow the shared date parsing path described in src/lib/kb/causes.ts.\n4. Month-first interpretation produces 4 July 2026. R-41200 reports that April/July swap.'
    : '1. Use copper.studio (es-ES, booking-v3) through the form channel.\n2. Follow the visible MM/DD/YYYY hint and enter 01/06/2026 intending 6 January 2026.\n3. The day-first form interpretation produces 1 June 2026. R-41230 reports 1 June instead of 6 January.\n4. Compare the same tenant through app/email: the supplied classifier assigns that path to parser, not hint.';
  const expected = parser ? 'The parsed invite/reminder date preserves the tenant-intended calendar date.' : 'The printed hint, validation and date interpretation agree on one tenant-aware convention.';
  const actual = parser ? 'Ambiguous day/month values can be swapped, sending an invite or reminder for another date.' : 'Following the booking-v3 hint can swap day and month before the booking is created.';
  const repair = parser ? 'Use an explicit tenant-aware input format, validate ambiguous input and carry an unambiguous date value through invites/reminders.' : 'Generate the hint and validation from the same convention used to interpret the form. Check booking-v2, booking-v3 and non-form paths independently.';
  const atypical = parser ? `\n## Atypical descriptions and uncertainty\n\nThe desk flags ${result.atypical.length} descriptions: ${result.atypical.map(r => r.id).join(', ')}. They remain in this classifier-derived count, including one-day-move and otherwise ambiguous wording. This accounting assignment does not establish a shared mechanism for each description. Reproduce and investigate them; track them separately in issue 3, which stays open. The parser fix is not evidence that these descriptions are resolved; their technical root cause is unconfirmed.\n` : '';
  const sample = group.reports.slice(0, 3).map(r => `- **${r.id}** — ${r.tenant}, ${r.channel}, ${tenantOf(r).locale}, ${tenantOf(r).form}; received ${r.receivedAt}.\n  > ${r.body}`).join('\n');
  const body = `# ${title}\n\n**Reports covered: ${group.reports.length}.** Source ticket: #4471. Classification: \`${group.cause}\`.\n\n## Problem\n\n${mechanism}\n\n## Reproduction from the supplied model\n\n${steps}\n\nThese steps are grounded in the exported classifier and report examples; no production application is included, so a production reproduction or deployed fix has not been verified.\n\n**Expected:** ${expected}\n\n**Actual:** ${actual}\n\n## Scope and evidence\n\n- Dataset: support-kb export dated 2026-10-04, reviewed 2026-10-28. This is a snapshot, not the live desk.\n- ${group.reports.length} distinct report IDs; ${group.tenants} tenants; first seen ${group.firstSeen}; last seen ${group.lastSeen}.\n- Counted with the supplied uniqueById, tenant directory, causeOf and groupByCause. Overlapping export rows count once. Different IDs remain different reports, even if their words match.\n- Intake tags in this group: ${Object.entries(group.taggedAs).map(([tag,n]) => `${tag}: ${n}`).join(', ')}. Tags and browser locale are not the tenant's ground truth.\n- Full membership: [CSV](../static/evidence/reports-by-cause.csv) and [audit JSON](../static/evidence/audit.json), group \`${group.cause}\`.\n\n${sample}\n${atypical}\n## Proposed repair and acceptance checks\n\n${repair}\n\n- Check a day-first tenant with an ambiguous date and an unambiguous date; verify stored date, invitation and reminder agree.\n- Check a month-first tenant as a regression control; do not infer locale from the reporter's browser.\n- Check the other defect independently; closing this ticket must not close the other mechanism by implication.\n- Reconcile new reports and configuration changes against the ID manifest before updating coverage.\n\n## Related documentation\n\n[Signed incident review](../src/routes/kb/reviews/4471/+page.svx), [rendered review](../build/kb/reviews/4471/index.html), and [proposed replacement for subject-only triage](../src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx). No deployed fix has been verified.\n`;
  const publishedBody = body
    .replaceAll('(../static/', `(${githubBase}/static/`)
    .replaceAll('(../src/', `(${githubBase}/src/`)
    .replaceAll('(../build/', `(${githubBase}/build/`);
  const outcome = parser
    ? 'FIXED: engineering reports `fix(dates): parse dd/mm for eu locales`. Close as completed. Five one-day descriptions remain separately open in issue 3; the desk count includes them, but their resolution is not implied.'
    : "WON’T FIX: engineering retired the booking-v3 form. Close as not planned; this is retirement, not a verified hint repair.";
  writeFileSync(new URL(`${group.cause}.md`, issueDir), publishedBody + `\n## Engineering update and current outcome\n\n[Course desk update](https://hq.mega.dev/challenges/what-it-shows), read 2026-10-28: #4471 closed 05 Oct. ${outcome} This supersedes the earlier investigation-only closing explanation.\n`);
}
const partitionIds = Object.values(audit.problemPartition).flat();
assert.equal(partitionIds.length, result.reports.length);
assert.equal(new Set(partitionIds).size, result.reports.length);
assert.ok(result.atypical.every(r => causeOf(r, tenantOf(r)) === 'parser'));
const shiftBody = `# Dates move by one day or disagree across time zones\n\n**Reports covered: ${result.atypical.length}.** Source ticket: #4471. Status: **open**.\n\n## Problem and evidence\n\nThese descriptions are not explained by swapping day and month. They are listed in the desk's original oneDayMove notes. A time-zone or day-boundary bug is a working hypothesis; the export does not establish the root cause of every description.\n\n${result.atypical.map(r => `- **${r.id}**, ${r.tenant}, ${r.channel}, received ${r.receivedAt}:\n  > ${r.body}`).join('\n')}\n\n## Accounting\n\nThe supplied desk classifier files these five IDs under parser (379). They are a subset of that bucket, not five additional reports. A disjoint count is 374 parser, 33 hint and 5 one-day descriptions = 412 unique report IDs. Keep the original accounting visible while tracking this distinct unresolved problem.\n\n## Why this remains open\n\n[Engineering update](https://hq.mega.dev/challenges/what-it-shows), read 2026-10-28: #4471 closed 05 Oct. The parser was fixed by changing date field order; booking-v3 was retired. Neither ending reports a fix for one-day shifts or different days for the same meeting. Closing the parent is not evidence that these reports are resolved.\n\n## Investigation and acceptance\n\nReproduce a date-only booking across Lisbon and Toronto, record the entered calendar date, stored representation and invitation in both zones, and check midnight/DST boundaries. Investigate the early-arriving invitation separately if it has another mechanism. Close only when a remedy or another evidence-backed disposition covers the observed reports.\n\n[Signed review](${githubBase}/src/routes/kb/reviews/4471/+page.svx) · [Rendered review](${githubBase}/build/kb/reviews/4471/index.html) · [Full evidence](${githubBase}/static/evidence/audit.json).\n`;
writeFileSync(new URL('one-day.md', issueDir), shiftBody);
console.log(JSON.stringify({ raw: result.rawCount, unique: result.reports.length, overlaps: result.duplicates.length, groups: audit.groups.map(g => ({ cause: g.cause, count: g.count })), problemPartition: Object.fromEntries(Object.entries(audit.problemPartition).map(([k,v]) => [k,v.length])), mismatchedTags: result.mismatch.length, atypical: result.atypical.length, deskRef: audit.deskRef, checksPassed: audit.checks.length }, null, 2));
