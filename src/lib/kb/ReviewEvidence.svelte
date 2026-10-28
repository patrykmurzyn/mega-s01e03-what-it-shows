<script lang="ts">
  import raw from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { review } from '#lib/kb/review';
  const data = review(raw as Report[], tenantOf, notes.oneDayMove);
  let selected = $state('all');
  let query = $state('');
  const filtered = $derived(data.reports.filter(r =>
    (selected === 'all' || causeOf(r, tenantOf(r)) === selected) &&
    `${r.id} ${r.tenant} ${r.subject} ${r.body}`.toLowerCase().includes(query.toLowerCase())
  ));
</script>

<section aria-label="Export reconciliation">
  <div class="stats">
    <div><strong>{data.rawCount}</strong><span>export rows</span></div>
    <div><strong>{data.duplicates.length}</strong><span>overlap copies</span></div>
    <div><strong>{data.reports.length}</strong><span>distinct reports</span></div>
  </div>
  <p>One report per <code>id</code>. Repeated export copies are identical; identical words with different IDs remain separate reports.</p>
  <p><strong>{data.mismatch.length}</strong> intake tags disagree with the tenant-aware cause. The tag is an intake guess, not a diagnosis.</p>
  <p>Reports received: <strong>{data.firstSeen}</strong> to <strong>{data.lastSeen}</strong>. First merge: <strong>{data.firstMerged?.slice(0, 10)}</strong>.</p>
  {#if data.busiestMerge}<p><strong>{data.busiestMerge.count}</strong> reports were merged on <strong>{data.busiestMerge.day}</strong>. That is a triage event, not the date all those failures began.</p>{/if}
  <table>
    <caption>Received and merged counts by the calendar month recorded in each timestamp</caption>
    <thead><tr><th>month</th><th>received</th><th>merged</th></tr></thead>
    <tbody>{#each data.months as m}<tr><td>{m.month}</td><td>{m.received}</td><td>{m.merged}</td></tr>{/each}</tbody>
  </table>
</section>

<h3>Three problems and their current outcomes</h3>
<table>
  <caption>Desk accounting and separately tracked unresolved reports</caption>
  <thead><tr><th>Problem</th><th>Reports</th><th>Outcome</th></tr></thead>
  <tbody>
    {#each data.groups as g}<tr><td>{g.cause}</td><td>{g.reports.length}</td><td>{g.cause === 'parser' ? 'Fixed: tenant-aware parser' : 'Won’t fix: booking-v3 retired'}</td></tr>{/each}
    <tr><td><a href="https://github.com/patrykmurzyn/mega-s01e03-what-it-shows/issues/3">one-day moves</a></td><td>{data.atypical.length}</td><td>Open: not covered by either ending</td></tr>
  </tbody>
</table>
<p>The one-day row is a subset of the desk's parser bucket, not extra reports. A disjoint problem accounting is {data.groups.find(g => g.cause === 'parser')!.reports.length - data.atypical.length} parser, {data.groups.find(g => g.cause === 'hint')!.reports.length} hint and {data.atypical.length} one-day reports: {data.reports.length} unique IDs.</p>

<h3>One-day moves remain open</h3>
<p>The desk flags <strong>{data.atypical.length}</strong> descriptions as one-day-move readings. The desk files them under parser, but their descriptions do not establish a day/month swap. They are tracked separately in issue 3. The parser fix changes field order and the form was retired; neither reports a remedy for this problem. A time-zone or day-boundary defect is a hypothesis to investigate, not an established root cause.</p>
{#each data.atypical as r}
  <details>
    <summary>{r.id} · {r.tenant} · assigned {causeOf(r, tenantOf(r))}</summary>
    <p>{r.body}</p>
    <p class="muted">{r.channel} · received {r.receivedAt} · merged {r.mergedAt}</p>
  </details>
{/each}

<h3>Trace every report</h3>
<p><a href="/evidence/reports-by-cause.csv">Download the complete ID-to-cause map (CSV)</a> · <a href="/evidence/audit.json">Audit and original row positions (JSON)</a></p>
<div class="filters">
  <label>Cause <select bind:value={selected}><option value="all">All causes</option>{#each data.groups as g}<option value={g.cause}>{g.cause}</option>{/each}</select></label>
  <label>Find a report <input bind:value={query} placeholder="ID, tenant or words" type="search" /></label>
</div>
<p aria-live="polite">{filtered.length} matching reports · showing {Math.min(filtered.length, 12)}</p>
{#each filtered.slice(0, 12) as r (r.id)}
  <details>
    <summary>{r.id} · {causeOf(r, tenantOf(r))} · {r.tenant}</summary>
    <p><strong>{r.subject}</strong></p><p>{r.body}</p>
    <p class="muted">{r.channel} · {tenantOf(r)?.locale} · {tenantOf(r)?.form} · intake tag {r.meta.intakeTag}</p>
  </details>
{/each}

<style>
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.7rem; margin: 1.5rem 0; }
  .stats div { padding: 1rem; border: 1px solid var(--line); background: var(--note-bg); border-radius: 6px; }
  .stats strong { display: block; font-size: 2rem; line-height: 1.2; font-variant-numeric: tabular-nums; }
  .stats span, .muted, caption { color: var(--muted); font-size: 0.85rem; }
  caption { text-align: left; }
  details { border-bottom: 1px solid var(--line); padding: 0.6rem 0; overflow-wrap: anywhere; }
  summary { cursor: pointer; font-family: var(--mono); font-size: 0.85rem; }
  .filters { display: flex; flex-wrap: wrap; gap: 1rem; }
  label { display: grid; gap: 0.3rem; }
  input, select { padding: 0.5rem; background: var(--bg); color: var(--fg); border: 1px solid var(--line); border-radius: 4px; font: inherit; max-width: 100%; }
  @media (max-width: 420px) { .stats { gap: 0.35rem; } .stats div { padding: 0.55rem; } .stats strong { font-size: 1.6rem; } }
</style>
