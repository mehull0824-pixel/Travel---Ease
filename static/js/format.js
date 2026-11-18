export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Today as YYYY-MM-DD in the local timezone. */
export const todayStr = () => new Date().toLocaleDateString('en-CA');

/** Real calendar date label for a trip day, or '' when no start date is set. */
export function dayDate(startDate, day) {
  if (!startDate) return '';
  const d = new Date(startDate + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + day - 1);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function itineraryToText(it, input) {
  const L = [`TRAVEL EASE — ${it.destinationName}`, it.summary, ''];
  if (it.ai?.overview) L.push(it.ai.overview, '');
  for (const d of it.days) {
    const dt = dayDate(input.startDate, d.day);
    L.push(`DAY ${d.day}${dt ? ' (' + dt + ')' : ''} — ${d.theme} (est. ${inr(d.costs.total)})`);
    for (const a of d.activities) L.push(`  ${a.time} ${a.slot}: ${a.name} (~${a.hours}h, ${a.totalCost ? inr(a.totalCost) : 'free'})`);
    d.meals.forEach((m) => L.push(`  ${m.type}: ${m.suggestion}`));
    L.push('');
  }
  L.push('BUDGET');
  it.budget.lines.forEach((l) => L.push(`  ${l.label}: ${inr(l.total)}`));
  L.push(
    '',
    `  TOTAL: ${inr(it.budget.total)} | Budget: ${inr(input.budget)} | ${it.budget.remaining >= 0 ? 'Remaining' : 'Over by'}: ${inr(Math.abs(it.budget.remaining))}`,
    '',
    it.disclaimer,
  );
  const sv = it.services;
  if (sv) {
    L.push('', `EMERGENCY NUMBERS (${sv.emergency.country})`, `  Main emergency number: ${sv.emergency.general}`);
    sv.emergency.numbers.forEach((n) => L.push(`  ${n.service}: ${n.number}`));
    if (sv.emergency.embassy) L.push('  Indian Embassy/High Commission: save its number before you leave (https://www.mea.gov.in/indian-missions-abroad-new.htm)');
    L.push('', 'GETTING THERE');
    sv.travel.modes.forEach((m) => L.push(`  ${m.title}: ${m.detail}`));
    L.push('', 'WHERE TO STAY');
    sv.stay.areas.forEach((a) => L.push(`  ${a.area} (${a.tier}): ${a.why}`));
    L.push('', `Best time: ${sv.essentials.bestTime}`);
  }
  return L.join('\n');
}
