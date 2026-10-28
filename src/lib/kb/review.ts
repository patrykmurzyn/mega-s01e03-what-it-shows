import { causeOf, groupByCause, uniqueById, type Report, type Tenant } from './causes.ts';

export function review(raw: Report[], tenantOf: (r: Report) => Tenant | undefined, oneDayMove: string[], ticket = 4471) {
  const first = new Map<string, Report>();
  const duplicates: string[] = [];
  for (const r of raw) {
    if (first.has(r.id)) {
      if (JSON.stringify(first.get(r.id)) !== JSON.stringify(r)) throw new Error(`Conflicting export copies: ${r.id}`);
      duplicates.push(r.id);
    } else first.set(r.id, r);
  }
  const reports = uniqueById(raw).filter(r => r.mergedInto === ticket);
  const groups = groupByCause(reports, tenantOf);
  if (groups.some(g => g.cause === 'unplaced')) throw new Error('Unplaced report: review the tenant directory before publishing');
  const ids = new Set(reports.map(r => r.id));
  for (const id of oneDayMove) if (!ids.has(id)) throw new Error(`Desk note references missing report: ${id}`);
  const mismatch = reports.filter(r => r.meta.intakeTag !== causeOf(r, tenantOf(r)));
  const dates = reports.map(r => r.receivedAt.slice(0, 10)).sort();
  const months = new Map<string, { month: string; received: number; merged: number }>();
  const mergedDays = new Map<string, number>();
  const add = (date: string, field: 'received' | 'merged') => {
    const month = date.slice(0, 7);
    if (!months.has(month)) months.set(month, { month, received: 0, merged: 0 });
    months.get(month)![field]++;
  };
  for (const r of reports) {
    add(r.receivedAt, 'received');
    if (r.mergedAt) {
      add(r.mergedAt, 'merged');
      const d = r.mergedAt.slice(0, 10);
      mergedDays.set(d, (mergedDays.get(d) ?? 0) + 1);
    }
  }
  const busiest = [...mergedDays].sort((a, b) => b[1] - a[1])[0];
  return {
    rawCount: raw.length, reports, groups, duplicates, mismatch,
    atypical: reports.filter(r => oneDayMove.includes(r.id)),
    firstSeen: dates[0], lastSeen: dates.at(-1),
    firstMerged: reports.map(r => r.mergedAt).filter(Boolean).sort()[0],
    busiestMerge: busiest ? { day: busiest[0], count: busiest[1] } : null,
    months: [...months.values()].sort((a, b) => a.month.localeCompare(b.month))
  };
}
