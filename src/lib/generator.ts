import { DESTINATIONS } from '../data/destinations';
import type {
  AgeGroup, Alternative, Attraction, Destination, DayPlan, Interest, Itinerary, Pace,
  PlannedActivity, SlotName, TravelStyle, TripInput,
} from '../types';

export const INTERESTS: Interest[] = ['nature', 'adventure', 'beaches', 'history', 'culture', 'food', 'shopping', 'relaxation', 'sightseeing'];
export const DISCLAIMER =
  'All prices are illustrative sample estimates for planning only. They are not verified current prices, and no live availability, weather or routes were checked.';

export const getDestination = (id: string): Destination | undefined => DESTINATIONS.find((d) => d.id === id);

const ACC_MULT = { any: 1, hostel: 0.55, homestay: 0.8, hotel: 1.1, resort: 1.9 } as const;
const INTERCITY_MULT: Record<TravelStyle, number> = { budget: 1, balanced: 1.3, comfort: 2 };
const SLOTS: Record<Pace, Array<[SlotName, string]>> = {
  relaxed: [['Morning', '10:00'], ['Evening', '17:00']],
  balanced: [['Morning', '09:30'], ['Afternoon', '14:30'], ['Evening', '18:00']],
  packed: [['Morning', '08:30'], ['Afternoon', '12:30'], ['Afternoon', '15:30'], ['Evening', '18:30']],
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function validateInput(i: Partial<TripInput>): Record<string, string> {
  const e: Record<string, string> = {};
  if (!i.destinationId || !getDestination(i.destinationId)) e.destinationId = 'Please choose a destination from the list.';
  if (!i.age) e.age = 'Please select an age group.';
  if (!Number.isFinite(i.budget) || (i.budget as number) < 1000) e.budget = 'Enter a total budget of at least ₹1,000.';
  if (!Number.isInteger(i.days) || (i.days as number) < 1 || (i.days as number) > 15) e.days = 'Duration must be a whole number from 1 to 15 days.';
  if (!Number.isInteger(i.travellers) || (i.travellers as number) < 1 || (i.travellers as number) > 20) e.travellers = 'Travellers must be a whole number from 1 to 20.';
  if (!i.interests || i.interests.length === 0) e.interests = 'Pick at least one interest.';
  if (i.startDate && i.startDate < new Date().toLocaleDateString('en-CA')) e.startDate = 'Start date cannot be in the past.';
  return e;
}

/** Cost model shared by the itinerary and the alternatives so numbers always agree. */
function costModel(d: Destination, input: TripInput, style: TravelStyle, activitiesTotal: number, days = input.days) {
  const n = input.travellers;
  const nights = Math.max(days - 1, 0);
  const rooms = Math.ceil(n / 2);
  const stayNight = Math.round(rooms * d.stay[style] * ACC_MULT[input.accommodation]);
  const stay = stayNight * nights;
  const foodDay = d.food[style] * n;
  const food = foodDay * days;
  const localDay = d.local[style] * Math.ceil(n / 4);
  const local = localDay * days;
  const intercity = Math.round(d.intercityPP * INTERCITY_MULT[style]) * n;
  const subtotal = intercity + stay + food + local + activitiesTotal;
  const misc = Math.round(subtotal * 0.08);
  return { n, nights, stayNight, stay, foodDay, food, localDay, local, intercity, activities: activitiesTotal, misc, total: subtotal + misc };
}

function ageNotes(age: AgeGroup | '', accessibility: boolean): string[] {
  const notes: string[] = [];
  const map: Record<AgeGroup, string> = {
    under18: 'For younger travellers: carry ID documents, stay with a guardian, and confirm age/weight rules with adventure operators.',
    '18-25': 'Hostels, homestays and shared transport are good ways to stretch your budget.',
    '26-40': 'Popular experiences can fill up on weekends; consider booking key activities in advance.',
    '41-60': 'Short breaks between sights keep the trip comfortable; start busy days early.',
    above60: 'Comfortable pacing is suggested: fewer steep walks, medicines in hand baggage, and a check on step-free access at each site.',
  };
  if (age) notes.push(map[age]);
  if (accessibility) notes.push('Activities needing strenuous walking or climbing were left out. Please confirm accessibility with each venue.');
  return notes;
}

function scoreAttraction(a: Attraction, input: TripInput, slot: SlotName, allowanceLeftPP: number, rand: () => number): number {
  if (a.intense && input.accessibility) return -Infinity;
  if (input.freeOnly && a.costPerPerson > 0) return -Infinity;
  let s = a.categories.filter((c) => input.interests.includes(c)).length * 3;
  if (a.costPerPerson === 0) s += input.style === 'budget' ? 1.5 : 0.5;
  else if (a.costPerPerson > allowanceLeftPP) s -= 5;
  if (a.intense && (input.age === 'above60' || input.age === 'under18')) s -= 2; // soft nudge, not a ban
  if (a.intense && input.pace === 'relaxed') s -= 1;
  if (input.pace === 'relaxed' && a.hours > 4) s -= 1;
  const want = slot.toLowerCase();
  s += a.slot === want ? 1.5 : a.slot === 'any' ? 0 : -1.5;
  return s + rand() * 1.2; // seed-based variety so "Regenerate" gives a different plan
}

const label = (c: Interest) => c.charAt(0).toUpperCase() + c.slice(1);

export function generateItinerary(input: TripInput, seed: number = Date.now()): Itinerary {
  const dest = getDestination(input.destinationId);
  if (!dest) throw new Error('Unknown destination');
  const rand = rng(seed);
  const n = input.travellers;

  const base = costModel(dest, input, input.style, 0);
  const allowancePP = Math.max(0, (input.budget - base.total) / 1.08 / n);
  let spentPP = 0;
  const used = new Set<string>();
  const days: DayPlan[] = [];

  for (let day = 1; day <= input.days; day++) {
    const activities: PlannedActivity[] = [];
    for (const [slot, time] of SLOTS[input.pace]) {
      let best: Attraction | undefined;
      let bestScore = -Infinity;
      for (const a of dest.attractions) {
        if (used.has(a.id)) continue;
        const s = scoreAttraction(a, input, slot, allowancePP - spentPP, rand);
        if (s > bestScore) { best = a; bestScore = s; }
      }
      const q = encodeURIComponent;
      if (best) {
        used.add(best.id);
        spentPP += best.costPerPerson;
        const matched = best.categories.filter((c) => input.interests.includes(c));
        const reason = matched.length
          ? `Matches your interest in ${matched.map(label).join(' & ').toLowerCase()}.`
          : 'Adds variety to your trip.';
        activities.push({
          attractionId: best.id, name: best.name, desc: best.desc, slot, time, hours: best.hours,
          costPerPerson: best.costPerPerson, totalCost: best.costPerPerson * n, categories: best.categories,
          reason: reason + (best.costPerPerson === 0 ? ' Free to enjoy.' : ''),
          transport: `Suggested: ${dest.transportTip}`,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${q(best.name + ' ' + dest.name)}`,
          isFiller: false,
        });
      } else {
        activities.push({
          attractionId: `filler-${day}-${slot}`, name: 'Free time & local exploring',
          desc: `Unplanned time to wander, rest, shop or revisit a favourite spot in ${dest.name}.`, slot, time, hours: 2,
          costPerPerson: 0, totalCost: 0, categories: ['relaxation'], reason: 'All suitable attractions are already in your plan.',
          transport: 'Walk or use local transport as needed',
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${q('markets in ' + dest.name)}`, isFiller: true,
        });
      }
    }
    // Day theme = most frequent category of the day's activities
    const counts = new Map<Interest, number>();
    activities.filter((a) => !a.isFiller).forEach((a) => a.categories.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1)));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const m = dest.dishes;
    days.push({
      day, theme: top ? `${label(top)} day` : 'Easy day',
      activities,
      meals: [
        { type: 'Breakfast', suggestion: 'Local breakfast near your stay' },
        { type: 'Lunch', suggestion: `Try ${m[(day - 1) % m.length]} or a local thali` },
        { type: 'Dinner', suggestion: `Try ${m[day % m.length]} at a well-reviewed local eatery` },
      ],
      costs: { activities: 0, food: 0, local: 0, stay: 0, total: 0 },
    });
  }

  const actTotal = days.reduce((s, d) => s + d.activities.reduce((x, a) => x + a.totalCost, 0), 0);
  const c = costModel(dest, input, input.style, actTotal);
  days.forEach((d) => {
    const act = d.activities.reduce((x, a) => x + a.totalCost, 0);
    const stay = d.day <= c.nights ? c.stayNight : 0;
    d.costs = { activities: act, food: c.foodDay, local: c.localDay, stay, total: act + c.foodDay + c.localDay + stay };
  });

  const pp = (x: number) => Math.round(x / n);
  const budget = {
    lines: [
      { key: 'intercity', label: 'Intercity travel', total: c.intercity, perPerson: pp(c.intercity), note: 'Round trip, sample estimate from a major city. Per person × travellers.' },
      { key: 'stay', label: 'Accommodation', total: c.stay, perPerson: pp(c.stay), note: `${Math.ceil(n / 2)} room(s) × ${c.nights} night(s); rooms assume 2 people each. Group cost shared.` },
      { key: 'food', label: 'Food', total: c.food, perPerson: pp(c.food), note: 'Three meals a day per person.' },
      { key: 'local', label: 'Local transport', total: c.local, perPerson: pp(c.local), note: `Shared per vehicle (up to 4 people per vehicle).` },
      { key: 'activities', label: 'Activities & tickets', total: c.activities, perPerson: pp(c.activities), note: 'Entry fees and paid experiences in your plan.' },
      { key: 'misc', label: 'Miscellaneous & contingency (8%)', total: c.misc, perPerson: pp(c.misc), note: 'Tips, shopping, small unexpected costs.' },
    ],
    total: c.total, perPersonTotal: pp(c.total), budget: input.budget,
    remaining: input.budget - c.total, withinBudget: c.total <= input.budget,
  };

  // Lower-cost alternatives, using the same cost model
  const alts: Alternative[] = [];
  const add = (title: string, detail: string, total: number, apply: Alternative['apply']) => {
    if (c.total - total > 0) alts.push({ title, detail, estimatedTotal: total, saving: c.total - total, apply });
  };
  const free = dest.attractions.filter((a) => a.costPerPerson === 0).slice(0, 4).map((a) => a.name).join(', ');
  if (input.style !== 'budget') add('Switch to budget style', 'Budget hotels/guesthouses, simpler meals and shared transport.', generateItinerary({ ...input, style: 'budget' }, seed).budget.total, { style: 'budget' });
  if (!input.freeOnly) add('Choose free attractions only', `Skip paid tickets. Free options include: ${free || 'local markets and viewpoints'}.`, costModel(dest, input, input.style, 0).total, { freeOnly: true });
  if (!input.freeOnly && input.style !== 'budget') add('Budget style + free attractions', 'The cheapest combination of the options above.', costModel(dest, input, 'budget', 0).total, { style: 'budget', freeOnly: true });
  if (input.days > 1) add(`Shorten the trip to ${input.days - 1} day(s)`, 'Removes one day of stay, food, transport and activities.', generateItinerary({ ...input, days: input.days - 1 }, seed).budget.total, { days: input.days - 1 });

  let warning: string | undefined;
  if (!budget.withinBudget) {
    const cheapest = costModel(dest, input, 'budget', 0).total;
    warning = `Estimated cost ₹${c.total.toLocaleString('en-IN')} is ₹${(c.total - input.budget).toLocaleString('en-IN')} over your budget of ₹${input.budget.toLocaleString('en-IN')}. See the lower-cost alternatives below.` +
      (cheapest > input.budget ? ' Even the cheapest option here exceeds your budget, so consider fewer days, fewer travellers, or a higher budget.' : '');
  }

  const topInterests = input.interests.map(label).join(', ');
  const reasons = [
    `Activities were ranked by how many of your interests (${topInterests}) they match.`,
    `${input.style.charAt(0).toUpperCase() + input.style.slice(1)} travel style sets the stay, food and transport estimates.`,
    `A ${input.pace} pace gives ${SLOTS[input.pace].length} activity slot(s) per day.`,
    allowancePP <= 0 ? 'Your budget leaves little room for paid activities, so free attractions were favoured.' : 'Paid attractions were chosen only while they fit the remaining budget.',
  ];

  return {
    id: `trip-${seed}-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), seed,
    destinationId: dest.id, destinationName: dest.name,
    summary: `${input.days}-day ${input.style} trip to ${dest.name} for ${n} traveller${n > 1 ? 's' : ''}${input.startCity ? ` from ${input.startCity}` : ''}.`,
    reasons, ageNotes: ageNotes(input.age, input.accessibility), days, budget, alternatives: alts, warning,
    source: 'rule-based', disclaimer: DISCLAIMER,
  };
}
