import { itineraryToText } from './format.js';
import { loadTrips, persistTrips } from './storage.js';
import * as V from './views.js';

const DEFAULT_INPUT = {
  destinationId: '', startCity: '', age: '', budget: 25000, days: 4, travellers: 2,
  interests: [], style: 'balanced', pace: 'balanced', accommodation: 'any', accessibility: false, freeOnly: false, startDate: '',
};

const s = {
  page: 'home', input: { ...DEFAULT_INPUT }, errors: {}, itinerary: null, loading: false,
  trips: loadTrips(), meta: { destinations: [], interests: [] }, destQuery: '', optOpen: false,
  region: 'all', emergency: null, svc: { destId: '', startCity: '', data: null, loading: false },
};

const $ = (id) => document.getElementById(id);
let toastTimer;

function toast(kind, text) {
  const el = $('toast');
  el.innerHTML = '';
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.setAttribute('role', 'status');
  t.textContent = text;
  t.onclick = () => (el.innerHTML = '');
  el.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.innerHTML = ''), 4500);
}

function render(enter = false) {
  $('app').classList.toggle('enter', enter);
  $('navbar').innerHTML = V.navbar(s.page, s.trips.length);
  let html = '';
  switch (s.page) {
    case 'home': html = V.home(s); break;
    case 'explore': html = V.explore(s.meta.destinations, s.region); break;
    case 'services': html = V.servicesPage(s); break;
    case 'trips': html = V.myTrips(s.trips); break;
    case 'how': html = V.how(); break;
    case 'about': html = V.about(); break;
    case 'results': html = s.itinerary ? V.results(s) : V.noResults(); break;
  }
  $('app').innerHTML = html;
}

function go(page) {
  s.page = page;
  if (page === 'services') loadEmergency();
  render(true);
  window.scrollTo({ top: 0 });
}

async function loadEmergency() {
  if (s.emergency) return;
  try {
    s.emergency = await (await fetch('/api/emergency')).json();
    if (s.page === 'services') render();
  } catch { /* directory simply stays on "Loading…" */ }
}

async function loadServices() {
  const destId = $('svc-dest')?.value;
  s.svc.startCity = ($('svc-city')?.value || '').trim();
  if (!destId) { toast('error', 'Please choose a destination first.'); return; }
  s.svc.destId = destId;
  s.svc.loading = true;
  render();
  try {
    const q = new URLSearchParams({ startCity: s.svc.startCity });
    const res = await fetch(`/api/services/${encodeURIComponent(destId)}?${q}`);
    if (!res.ok) throw new Error('bad');
    s.svc.data = (await res.json()).services;
  } catch {
    s.svc.data = null;
    toast('error', 'Could not load services. Is `python app.py` running?');
  }
  s.svc.loading = false;
  render();
}

async function generate(seed = Date.now(), override) {
  const inp = override ?? s.input;
  s.loading = true;
  s.errors = {};
  render();
  try {
    const res = await fetch('/api/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: inp, seed }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 400 && data.errors) {
      s.errors = data.errors;
      s.loading = false;
      go('home');
      toast('error', 'Please fix the highlighted fields before generating.');
      return;
    }
    if (!res.ok) throw new Error('Server error');
    s.itinerary = data.itinerary;
    s.loading = false;
    go('results');
  } catch {
    s.loading = false;
    render();
    toast('error', 'Could not reach the planner server. Is `python app.py` running?');
  }
}

function save() {
  if (!s.itinerary) return;
  const entry = { id: s.itinerary.id, savedAt: new Date().toISOString(), input: s.input, itinerary: s.itinerary };
  s.trips = [entry, ...s.trips.filter((t) => t.id !== entry.id)];
  persistTrips(s.trips);
  render();
  toast('success', 'Trip saved to My Trips.');
}

async function copy() {
  if (!s.itinerary) return;
  const text = itineraryToText(s.itinerary, s.input);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  }
  toast('success', 'Itinerary copied to clipboard.');
}

const actions = {
  nav: (el) => go(el.dataset.page),
  'pick-dest': (el) => {
    s.input.destinationId = el.dataset.id;
    for (const b of el.parentNode.children) { const on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }
  },
  'plan-dest': (el) => { s.input.destinationId = el.dataset.id; s.destQuery = ''; go('home'); },
  'open-trip': (el) => {
    const t = s.trips.find((x) => x.id === el.dataset.id);
    if (t) { s.input = t.input; s.itinerary = t.itinerary; go('results'); }
  },
  'delete-trip': (el) => {
    if (!window.confirm('Delete this saved trip?')) return;
    s.trips = s.trips.filter((t) => t.id !== el.dataset.id);
    persistTrips(s.trips);
    render();
    toast('info', 'Trip deleted.');
  },
  regenerate: () => generate(Math.floor(Math.random() * 1e9)),
  'set-region': (el) => { s.region = el.dataset.region; render(); },
  'svc-load': loadServices,
  save,
  copy,
  'new-trip': () => { s.input = { ...DEFAULT_INPUT }; s.itinerary = null; s.errors = {}; s.destQuery = ''; go('home'); },
  'apply-alt': (el) => {
    const a = s.itinerary.alternatives[Number(el.dataset.idx)];
    s.input = { ...s.input, ...a.apply };
    generate(s.itinerary.seed, s.input);
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (el && actions[el.dataset.action]) actions[el.dataset.action](el);
});

document.addEventListener('submit', (e) => {
  if (e.target.id !== 'plan-form') return;
  e.preventDefault();
  generate();
});

// Form fields update state without re-rendering, so typing never loses focus.
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'dest-search') {
    s.destQuery = t.value;
    $('dest-chips').innerHTML = V.destChips(s.meta.destinations, s.input, s.destQuery, s.region);
    return;
  }
  if (!t.closest('#plan-form') || !t.name) return;
  if (t.name === 'interest') {
    const set = new Set(s.input.interests);
    t.checked ? set.add(t.value) : set.delete(t.value);
    s.input.interests = s.meta.interests.filter((x) => set.has(x));
    t.parentElement.classList.toggle('on', t.checked);
  } else if (t.type === 'checkbox') s.input[t.name] = t.checked;
  else if (t.type === 'number') s.input[t.name] = Number(t.value);
  else s.input[t.name] = t.value;
});

document.addEventListener('toggle', (e) => {
  if (e.target.id === 'opt-details') s.optOpen = e.target.open;
}, true);

async function init() {
  render();
  try {
    const r = await fetch('/api/destinations');
    s.meta = await r.json();
  } catch {
    toast('error', 'Could not load destinations. Start the server with `python app.py`.');
  }
  render();
}
init();
