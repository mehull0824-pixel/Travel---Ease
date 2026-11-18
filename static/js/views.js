import { esc, inr, cap, todayStr, dayDate } from './format.js';

const COLORS = ['#10231d', '#2f5d4e', '#6f9a88', '#b7cfc3', '#c2410c', '#e3a07a', '#7c2d12'];
const REGIONS = [['all', 'All'], ['domestic', 'India'], ['international', 'International']];
const TIER = { budget: 'Budget', mid: 'Mid-range', luxury: 'Luxury' };
const AGES = [['under18', 'Under 18'], ['18-25', '18–25'], ['26-40', '26–40'], ['41-60', '41–60'], ['above60', 'Above 60']];
const NAV = [['home', 'Home'], ['explore', 'Explore Destinations'], ['trips', 'My Trips'], ['how', 'How It Works'], ['services', 'Services & Emergency'], ['about', 'About']];

export function navbar(page, tripCount) {
  return `<header class="nav">
    <button class="logo" data-action="nav" data-page="home" aria-label="Travel Ease home"><i class="logo-dot"></i>Travel<span>Ease</span></button>
    <nav aria-label="Main">${NAV.map(([p, l]) =>
      `<button class="${page === p ? 'active' : ''}" data-action="nav" data-page="${p}" ${page === p ? 'aria-current="page"' : ''}>${l}${p === 'trips' && tripCount > 0 ? ` (${tripCount})` : ''}</button>`).join('')}
    </nav></header>`;
}

export const regionTabs = (region) => `<div class="tabs" role="tablist" aria-label="Region">${REGIONS.map(([r, l]) =>
  `<button type="button" role="tab" aria-selected="${region === r}" class="tab${region === r ? ' on' : ''}" data-action="set-region" data-region="${r}">${l}</button>`).join('')}</div>`;

const inRegion = (d, region) => region === 'all' || d.region === region;

export const destChips = (dests, input, q, region = 'all') => {
  const m = dests.filter((d) => inRegion(d, region) && `${d.name} ${d.state} ${d.country || ''}`.toLowerCase().includes(q.trim().toLowerCase()));
  return m.map((d) => `<button type="button" aria-pressed="${input.destinationId === d.id}" class="chip${input.destinationId === d.id ? ' on' : ''}" data-action="pick-dest" data-id="${esc(d.id)}">${esc(d.name)}${d.region === 'international' ? ' <small>' + esc(d.country) + '</small>' : ''}</button>`).join('')
    || `<p class="muted">No destination matches “${esc(q)}”.</p>`;
};

const err = (errors, k) => (errors[k] ? `<p class="field-error" role="alert">${esc(errors[k])}</p>` : '');
const opt = (v, l, cur) => `<option value="${v}"${cur === v ? ' selected' : ''}>${l}</option>`;

export function planForm(s) {
  const { input: i, errors: e, loading, meta, destQuery } = s;
  return `<form class="card lift form" id="plan-form" novalidate aria-label="Trip planning form">
    <h2>Plan your trip</h2>
    <fieldset><legend>Destination *</legend>
      ${regionTabs(s.region)}
      <input type="search" id="dest-search" placeholder="Search destinations…" value="${esc(destQuery)}" aria-label="Search destinations" />
      <div class="chips" id="dest-chips" role="group" aria-label="Destination">${destChips(meta.destinations, i, destQuery, s.region)}</div>
      ${err(e, 'destinationId')}
    </fieldset>
    <div class="grid2">
      <label>Starting city (optional)<input name="startCity" value="${esc(i.startCity)}" placeholder="e.g. Delhi" maxlength="60" /></label>
      <label>Age group *<select name="age"><option value="">Select…</option>${AGES.map(([v, l]) => opt(v, l, i.age)).join('')}</select>${err(e, 'age')}</label>
      <label>Total budget (₹ INR) *<input type="number" name="budget" min="1000" step="500" inputmode="numeric" value="${i.budget || ''}" />${err(e, 'budget')}</label>
      <label>Duration (days) *<input type="number" name="days" min="1" max="15" value="${i.days || ''}" />${err(e, 'days')}</label>
      <label>Start date (optional)<input type="date" name="startDate" min="${todayStr()}" value="${esc(i.startDate || '')}" />${err(e, 'startDate')}</label>
      <label>Number of travellers *<input type="number" name="travellers" min="1" max="20" value="${i.travellers || ''}" />${err(e, 'travellers')}</label>
      <label>Travel style<select name="style">${opt('budget', 'Budget', i.style)}${opt('balanced', 'Balanced', i.style)}${opt('comfort', 'Comfort', i.style)}</select></label>
    </div>
    <fieldset><legend>Interests * (choose one or more)</legend>
      <div class="chips">${meta.interests.map((x) =>
        `<label class="chip${i.interests.includes(x) ? ' on' : ''}"><input type="checkbox" name="interest" value="${x}"${i.interests.includes(x) ? ' checked' : ''} />${cap(x)}</label>`).join('')}</div>
      ${err(e, 'interests')}
    </fieldset>
    <details class="optional" id="opt-details"${s.optOpen ? ' open' : ''}><summary>Optional preferences</summary>
      <div class="grid2">
        <label>Schedule<select name="pace">${opt('relaxed', 'Relaxed', i.pace)}${opt('balanced', 'Balanced', i.pace)}${opt('packed', 'Packed', i.pace)}</select></label>
        <label>Accommodation<select name="accommodation">${opt('any', 'No preference', i.accommodation)}${opt('hostel', 'Hostel', i.accommodation)}${opt('homestay', 'Homestay', i.accommodation)}${opt('hotel', 'Hotel', i.accommodation)}${opt('resort', 'Resort', i.accommodation)}</select></label>
      </div>
      <label class="check"><input type="checkbox" name="accessibility"${i.accessibility ? ' checked' : ''} /> I need accessibility-friendly activities (avoids strenuous treks)</label>
      <label class="check"><input type="checkbox" name="freeOnly"${i.freeOnly ? ' checked' : ''} /> Free attractions only (no paid tickets)</label>
    </details>
    <button class="btn primary big" type="submit"${loading ? ' disabled' : ''}>${loading ? 'Generating…' : 'Generate My Trip'}</button>
  </form>`;
}

export function home(s) {
  const feats = [['Personalized', 'Same destination, different plans based on your interests and budget.'],
    ['Budget-aware', 'Transparent cost breakdown with warnings and cheaper alternatives.'],
    ['Practical', 'Morning, afternoon and evening plans with meals and map links.'],
    ['India & abroad', 'Plan trips across India and to 13 international destinations, with visa and insurance estimates.'],
    ['Emergency ready', 'Local emergency numbers, hospitals nearby and embassy help for every trip.'],
    ['Getting there & staying', 'Flight, train and bus suggestions, plus where to stay and trip essentials.']];
  return `<section class="container hero"><div class="hero-copy"><h1>Your journey, your budget, your way.</h1>
    <p>Generate personalized travel plans within your budget — day-by-day itineraries, costs and smart alternatives in seconds.</p>
    <ol class="points">${feats.map(([t, d]) => `<li><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ol></div>
    ${planForm(s)}</section>`;
}

export function explore(all, region = 'all') {
  const dests = all.filter((d) => inRegion(d, region));
  return `<section class="container"><h1>Explore Destinations</h1>${regionTabs(region)}
    <p class="muted">Budget ranges are illustrative per-person daily estimates (stay share + food + local transport), not verified prices.</p>
    <div class="cards">${dests.map((d) => {
      const low = d.food.budget + d.stay.budget / 2 + d.local.budget / 4;
      const high = d.food.comfort + d.stay.comfort / 2 + d.local.comfort / 4;
      return `<article class="card dest">
        <h3 class="dest-img" style="background:${esc(d.gradient)}"><small>${esc(d.state)}${d.region === 'international' ? ' · International' : ''}</small>${esc(d.name)}</h3><p>${esc(d.tagline)}</p>
        <p class="muted small"><b>Best for:</b> ${d.bestFor.join(', ')}</p>
        <p class="muted small"><b>Top attractions:</b> ${d.attractions.slice(0, 3).map((a) => esc(a.name)).join(', ')}</p>
        <p><b>${inr(low)} – ${inr(high)}</b> <span class="muted small">per person / day (illustrative)</span></p>
        <button class="btn primary" data-action="plan-dest" data-id="${esc(d.id)}">Plan a trip to ${esc(d.name)}</button></article>`;
    }).join('')}</div></section>`;
}

export function myTrips(trips) {
  const body = trips.length === 0
    ? `<div class="card empty"><p class="lead">No saved trips yet.</p><p class="muted">Generate an itinerary and press Save. Trips are kept in this browser.</p><button class="btn primary" data-action="nav" data-page="home">Plan your first trip</button></div>`
    : `<div class="cards">${trips.map((t) => `<article class="card">
        <h3>${esc(t.itinerary.destinationName)}</h3><p>${esc(t.itinerary.summary)}</p>
        <p class="muted small">Saved ${esc(new Date(t.savedAt).toLocaleString())}</p>
        <p><b>${inr(t.itinerary.budget.total)}</b> estimated · budget ${inr(t.input.budget)}
          <span class="${t.itinerary.budget.withinBudget ? 'good' : 'bad'}">${t.itinerary.budget.withinBudget ? 'Within budget' : 'Over budget'}</span></p>
        <div class="actions"><button class="btn primary" data-action="open-trip" data-id="${esc(t.id)}">View</button>
          <button class="btn ghost danger" data-action="delete-trip" data-id="${esc(t.id)}">Delete</button></div></article>`).join('')}</div>`;
  return `<section class="container"><h1>My Trips</h1>${body}</section>`;
}

export function how() {
  const steps = [['1. Tell us about your trip', 'Choose a destination, budget, duration, group size, interests and style.'],
    ['2. We score the options', 'Every attraction is scored on interest match, affordability, pace and suitability.'],
    ['3. Get a day-by-day plan', 'Morning, afternoon and evening activities with meals, costs and map links.'],
    ['4. Check the budget', 'See a full cost breakdown, warnings if you are over budget, and cheaper alternatives.'],
    ['5. Get travel services', 'Emergency numbers, flight/train/bus options, where to stay and trip essentials come with every plan.']];
  return `<section class="container"><h1>How It Works</h1><div class="cards">${steps.map(([t, d]) => `<article class="card"><h3>${t}</h3><p>${d}</p></article>`).join('')}</div></section>`;
}

export function about() {
  return `<section class="container narrow"><h1>About Travel Ease</h1>
    <p>Travel Ease creates personalized itineraries so that two people visiting the same destination can get very different plans based on their budget and interests.</p>
    <p>The planner is a Python (Flask) service that works from a local dataset. When a Gemini API key is configured on the server, Gemini adds natural-language overviews and tips, which are validated before display.</p>
    <p class="muted">All prices are illustrative sample estimates. Travel Ease does not check live prices, availability, weather, visa rules or routes. Emergency numbers and visa notes are reference data. Always confirm details on official sites before booking or travelling.</p></section>`;
}

export function noResults() {
  return `<div class="container"><div class="card empty"><p class="lead">No itinerary yet.</p><p class="muted">Fill in the trip form and generate one.</p><button class="btn primary" data-action="nav" data-page="home">Plan a trip</button></div></div>`;
}

export function results({ itinerary: it, input, loading, trips }) {
  const b = it.budget;
  const saved = trips.some((t) => t.id === it.id);
  const dis = loading ? ' disabled' : '';
  return `<section class="container results">
    <div class="summary"><div>
      <h1>${esc(it.destinationName)} itinerary</h1><p>${esc(it.summary)}</p>
      ${it.ai ? `<p class="ai"><strong>AI overview.</strong> ${esc(it.ai.overview)}</p>` : ''}
      <p class="muted">Planner: ${it.source === 'gemini' ? 'Gemini-enhanced wording on top of rule-based plan' : 'Rule-based planner (local dataset)'}</p></div>
      <div class="stats">
        <div><span>Duration</span><b>${input.days} day${input.days > 1 ? 's' : ''}</b></div>
        <div><span>Travellers</span><b>${input.travellers}</b></div>
        <div><span>Estimated total</span><b>${inr(b.total)}</b></div>
        <div><span>Your budget</span><b>${inr(b.budget)}</b></div></div></div>
    <div class="actions">
      <button class="btn primary" data-action="regenerate"${dis}>${loading ? 'Working…' : 'Regenerate itinerary'}</button>
      <button class="btn ghost" data-action="nav" data-page="home">Edit trip details</button>
      <button class="btn" data-action="save">${saved ? 'Saved · update' : 'Save trip'}</button>
      <button class="btn" data-action="copy">Copy itinerary</button>
      <button class="btn ghost" data-action="new-trip">Start new trip</button></div>
    <div class="banner ${b.withinBudget ? 'ok' : 'warn'}" role="status">${b.withinBudget ? `Within budget: about ${inr(b.remaining)} remaining.` : esc(it.warning)}</div>
    <div class="two-col"><div><h2>Day-by-day plan</h2>
      ${it.days.map((d) => {
        const dt = dayDate(input.startDate, d.day);
        return `<article class="day"><header><h3>Day ${d.day}${dt ? ` · ${dt}` : ''} · ${esc(d.theme)}</h3><span class="price">${inr(d.costs.total)}</span></header>
          ${d.activities.map((a) => `<details class="activity"><summary><span class="time">${a.time} · ${a.slot}</span><strong>${esc(a.name)}</strong>
            <span class="muted">~${a.hours}h · ${a.totalCost ? inr(a.totalCost) : 'Free'}</span></summary>
            <p>${esc(a.desc)}</p><p><em>Why it fits:</em> ${esc(a.reason)}</p>
            <p class="muted">${esc(a.transport)}. ${a.costPerPerson ? `${inr(a.costPerPerson)} per person (illustrative).` : ''}</p>
            <a href="${esc(a.mapsUrl)}" target="_blank" rel="noreferrer">Search on Google Maps ↗</a></details>`).join('')}
          <ul class="meals">${d.meals.map((m) => `<li><b>${m.type}:</b> ${esc(m.suggestion)}</li>`).join('')}</ul>
          <p class="muted small">Day costs: activities ${inr(d.costs.activities)} · food ${inr(d.costs.food)} · local transport ${inr(d.costs.local)} · stay ${inr(d.costs.stay)}</p></article>`;
      }).join('')}</div>
      <aside>
        <div class="card lift"><h2>Budget breakdown</h2>
          <div class="bar" role="img" aria-label="Expense breakdown, itemised in the table below">${b.lines.map((l, k) => `<span style="width:${(l.total / b.total) * 100}%;background:${COLORS[k]}" title="${esc(l.label)}"></span>`).join('')}</div>
          <table><tbody>
            ${b.lines.map((l, k) => `<tr><td><i class="dot" style="background:${COLORS[k]}"></i>${esc(l.label)}<div class="muted small">${esc(l.note)}</div></td>
              <td class="num">${inr(l.total)}<div class="muted small">${inr(l.perPerson)}/person</div></td></tr>`).join('')}
            <tr class="total"><td>Total estimate</td><td class="num">${inr(b.total)}<div class="muted small">${inr(b.perPersonTotal)}/person</div></td></tr>
            <tr><td>Your budget</td><td class="num">${inr(b.budget)}</td></tr>
            <tr><td>${b.remaining >= 0 ? 'Remaining' : 'Over budget by'}</td><td class="num ${b.remaining >= 0 ? 'good' : 'bad'}">${inr(Math.abs(b.remaining))}</td></tr>
          </tbody></table>
          <p class="muted small">Includes: travel, stay, food, local transport, tickets, 8% contingency. Excludes: shopping, insurance, visas, personal items.</p></div>
        <div class="card"><h2>Budget-friendly alternatives</h2>
          ${it.alternatives.length === 0 ? '<p class="muted">This plan is already close to the lowest-cost option for your inputs.</p>' : ''}
          ${it.alternatives.map((a, k) => `<div class="alt"><b>${esc(a.title)}</b> <span class="good">saves ~${inr(a.saving)}</span>
            <p class="muted small">${esc(a.detail)} New estimate: ${inr(a.estimatedTotal)}${a.estimatedTotal <= b.budget ? ' (fits your budget)' : ' (still above budget)'}.</p>
            <button class="btn" data-action="apply-alt" data-idx="${k}"${dis}>Apply this option</button></div>`).join('')}</div>
        <div class="card"><h2>Why this plan?</h2><ul>${it.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
          ${it.ageNotes.length ? `<h3>Comfort & safety notes</h3><ul>${it.ageNotes.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
          ${it.ai && it.ai.tips.length ? `<h3>AI tips</h3><ul>${it.ai.tips.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}</div>
        <p class="muted small">${esc(it.disclaimer)}</p></aside></div>
    ${it.services ? `<h2 id="services">Travel services for ${esc(it.destinationName)}</h2>${servicesPanel(it.services)}` : ''}</section>`;
}


const links = (ls) => `<div class="linkrow">${ls.map((l) => `<a class="linkbtn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`).join('')}</div>`;
const list = (xs) => `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;

export function emergencyCard(e) {
  return `<div class="card emerg"><h3>Emergency numbers · ${esc(e.country)}</h3>
    <p class="bignum"><a href="tel:${esc(e.general.replace(/\s/g, ''))}">${esc(e.general)}</a> <span class="muted small">main emergency number</span></p>
    <table><tbody>${e.numbers.map((n) => `<tr><td>${esc(n.service)}</td><td class="num">${esc(n.number)}</td></tr>`).join('')}</tbody></table>
    ${e.note ? `<p class="muted small">${esc(e.note)}</p>` : ''}
    <h4>Find help nearby</h4>${links(e.nearby)}
    ${e.embassy ? `<h4>${esc(e.embassy.title)}</h4><p class="small">${esc(e.embassy.text)}</p>${links(e.embassy.links)}` : ''}
    <p class="muted small">${esc(e.disclaimer)}</p></div>`;
}

export function servicesPanel(sv) {
  const t = sv.travel, st = sv.stay, es = sv.essentials;
  return `<div class="svc-grid">
    ${emergencyCard(sv.emergency)}
    <div class="card"><h3>Getting there</h3>
      ${t.planNote.map((n) => `<p class="small">${esc(n)}</p>`).join('')}
      ${t.modes.map((m) => `<div class="mode"><b>${esc(m.title)}</b>
        <p class="small">${esc(m.detail)}</p><p class="muted small">${esc(m.suggestion)}</p>${links(m.links)}</div>`).join('')}
      <p class="muted small">${esc(t.disclaimer)}</p></div>
    <div class="card"><h3>Where to stay</h3>
      ${st.nightlyNote ? `<p class="small">${esc(st.nightlyNote)}</p>` : ''}
      ${st.areas.map((a) => `<div class="area"><span class="badge tier-${esc(a.tier)}">${esc(TIER[a.tier] || a.tier)}</span> <b>${esc(a.area)}</b>
        <span class="muted small"> · ${esc(a.why)}</span></div>`).join('')}
      <h4>Search stays</h4>${links(st.links)}${list(st.tips)}</div>
    <div class="card"><h3>Trip essentials</h3>
      <table><tbody>
        <tr><td>Best time</td><td>${esc(es.bestTime)}</td></tr>
        <tr><td>Currency</td><td>${esc(es.currency)}</td></tr>
        <tr><td>Language</td><td>${esc(es.language)}</td></tr>
        <tr><td>Power plug</td><td>${esc(es.plug)}</td></tr>
        ${es.visa ? `<tr><td>Visa</td><td>${esc(es.visa.summary)} <a href="${esc(es.visa.url)}" target="_blank" rel="noopener noreferrer">Official site ↗</a></td></tr>` : ''}
        <tr><td>Useful apps</td><td>${es.apps.map(esc).join(', ')}</td></tr></tbody></table>
      <h4>Local tips</h4>${list(es.tips)}
      <h4>Before you go</h4><ul class="checklist">${es.checklist.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      ${links(es.extras)}</div></div>`;
}

export function servicesPage(s) {
  const dests = s.meta.destinations;
  const group = (region, label) => `<optgroup label="${label}">${dests.filter((d) => d.region === region).map((d) =>
    `<option value="${esc(d.id)}"${s.svc.destId === d.id ? ' selected' : ''}>${esc(d.name)}${region === 'international' ? ', ' + esc(d.country) : ''}</option>`).join('')}</optgroup>`;
  const body = s.svc.loading ? '<p class="muted">Loading…</p>'
    : s.svc.data ? `<h2>${esc(s.svc.data.destinationName)}, ${esc(s.svc.data.country)}</h2>${servicesPanel(s.svc.data)}`
    : '<p class="muted">Choose a destination to see emergency numbers, flight/train/bus options, where to stay and essentials.</p>';
  return `<section class="container"><h1>Services &amp; Emergency</h1>
    <p class="muted">Pick any destination for emergency numbers, travel and stay suggestions, and trip essentials. No trip plan is needed.</p>
    <div class="card form"><div class="grid2">
      <label>Destination<select id="svc-dest"><option value="">Select…</option>${group('domestic', 'India')}${group('international', 'International')}</select></label>
      <label>Starting city (optional)<input id="svc-city" value="${esc(s.svc.startCity)}" placeholder="e.g. Delhi" maxlength="60" /></label></div>
      <button class="btn primary" data-action="svc-load">Show services</button></div>
    ${body}
    <h2>Emergency numbers by country</h2>${emergencyDirectory(s.emergency)}</section>`;
}

export function emergencyDirectory(data) {
  if (!data) return '<p class="muted">Loading…</p>';
  return `<div class="cards">${data.countries.map((c) => `<details class="card"><summary><b>${esc(c.country)}</b> · <span class="bignum-s">${esc(c.general)}</span></summary>
    <table><tbody>${c.numbers.map((n) => `<tr><td>${esc(n.service)}</td><td class="num">${esc(n.number)}</td></tr>`).join('')}</tbody></table>
    ${c.note ? `<p class="muted small">${esc(c.note)}</p>` : ''}</details>`).join('')}</div><p class="muted small">${esc(data.disclaimer)}</p>`;
}
