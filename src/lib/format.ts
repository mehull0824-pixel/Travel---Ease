import type { Itinerary, TripInput } from '../types';

export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

/** Today as YYYY-MM-DD in the local timezone. */
export const todayStr = () => new Date().toLocaleDateString('en-CA');

/** Real calendar date label for a given trip day, or '' when no start date is set. */
export function dayDate(startDate: string | undefined, day: number): string {
  if (!startDate) return '';
  const d = new Date(startDate + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + day - 1);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function itineraryToText(it: Itinerary, input: TripInput): string {
  const L: string[] = [`TRAVEL EASE — ${it.destinationName}`, it.summary, ''];
  if (it.ai?.overview) L.push(it.ai.overview, '');
  for (const d of it.days) {
    L.push(`DAY ${d.day}${dayDate(input.startDate, d.day) ? ' (' + dayDate(input.startDate, d.day) + ')' : ''} — ${d.theme} (est. ${inr(d.costs.total)})`);
    for (const a of d.activities) L.push(`  ${a.time} ${a.slot}: ${a.name} (~${a.hours}h, ${a.totalCost ? inr(a.totalCost) : 'free'})`);
    d.meals.forEach((m) => L.push(`  ${m.type}: ${m.suggestion}`));
    L.push('');
  }
  L.push('BUDGET');
  it.budget.lines.forEach((l) => L.push(`  ${l.label}: ${inr(l.total)}`));
  L.push(`  TOTAL: ${inr(it.budget.total)} | Budget: ${inr(input.budget)} | ${it.budget.remaining >= 0 ? 'Remaining' : 'Over by'}: ${inr(Math.abs(it.budget.remaining))}`, '', it.disclaimer);
  return L.join('\n');
}
