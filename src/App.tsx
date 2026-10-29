import { useEffect, useState } from 'react';
import Navbar, { type Page } from './components/Navbar';
import PlanForm from './components/PlanForm';
import Results from './components/Results';
import Explore from './components/Explore';
import MyTrips from './components/MyTrips';
import { About, HowItWorks } from './components/Info';
import { generateItinerary, validateInput } from './lib/generator';
import { itineraryToText } from './lib/format';
import { loadTrips, persistTrips } from './lib/storage';
import type { Itinerary, SavedTrip, TripInput } from './types';

const DEFAULT_INPUT: TripInput = {
  destinationId: '', startCity: '', age: '', budget: 25000, days: 4, travellers: 2,
  interests: [], style: 'balanced', pace: 'balanced', accommodation: 'any', accessibility: false, freeOnly: false, startDate: '',
};

type Toast = { kind: 'success' | 'error' | 'info'; text: string } | null;

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [input, setInput] = useState<TripInput>(DEFAULT_INPUT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<SavedTrip[]>(loadTrips);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => persistTrips(trips), [trips]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const go = (p: Page) => { setPage(p); window.scrollTo({ top: 0 }); };

  async function generate(seed: number = Date.now(), override?: TripInput) {
    const inp = override ?? input;
    const errs = validateInput(inp);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setToast({ kind: 'error', text: 'Please fix the highlighted fields before generating.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: inp, seed }),
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setItinerary(data.itinerary as Itinerary);
    } catch {
      // Backend unreachable or failed: fall back to the in-browser rule-based planner.
      setItinerary(generateItinerary(inp, seed));
      setToast({ kind: 'info', text: 'AI server unavailable. Generated with the built-in rule-based planner.' });
    } finally {
      setLoading(false);
    }
    go('results');
  }

  const isSaved = !!itinerary && trips.some((t) => t.id === itinerary.id);

  function save() {
    if (!itinerary) return;
    const entry: SavedTrip = { id: itinerary.id, savedAt: new Date().toISOString(), input, itinerary };
    setTrips((prev) => [entry, ...prev.filter((t) => t.id !== entry.id)]);
    setToast({ kind: 'success', text: 'Trip saved to My Trips.' });
  }

  async function copy() {
    if (!itinerary) return;
    const text = itineraryToText(itinerary, input);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setToast({ kind: 'success', text: 'Itinerary copied to clipboard.' });
  }

  return (
    <>
      <Navbar page={page} onNav={go} tripCount={trips.length} />
      {toast && <div className={'toast ' + toast.kind} role="status" onClick={() => setToast(null)}>{toast.text}</div>}
      <main>
        {page === 'home' && (
          <>
            <section className="hero">
              <div className="container">
                <h1>Your Journey, Your Budget, Your Way.</h1>
                <p>Generate personalized travel plans within your budget — day-by-day itineraries, costs and smart alternatives in seconds.</p>
              </div>
            </section>
            <div className="container form-wrap">
              <PlanForm input={input} setInput={setInput} errors={errors} loading={loading} onSubmit={() => generate()} />
            </div>
            <section className="container features">
              {[['🎯 Personalized', 'Same destination, different plans based on your interests and budget.'],
                ['💰 Budget-aware', 'Transparent cost breakdown with warnings and cheaper alternatives.'],
                ['🗺️ Practical', 'Morning, afternoon and evening plans with meals and map links.']].map(([t, d]) => (
                <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>
              ))}
            </section>
          </>
        )}
        {page === 'explore' && (
          <Explore onPlan={(id) => { setInput({ ...input, destinationId: id }); go('home'); }} />
        )}
        {page === 'trips' && (
          <MyTrips
            trips={trips}
            onStart={() => go('home')}
            onOpen={(t) => { setInput(t.input); setItinerary(t.itinerary); go('results'); }}
            onDelete={(id) => { setTrips((p) => p.filter((t) => t.id !== id)); setToast({ kind: 'info', text: 'Trip deleted.' }); }}
          />
        )}
        {page === 'how' && <HowItWorks />}
        {page === 'about' && <About />}
        {page === 'results' && itinerary && (
          <Results
            it={itinerary} input={input} saved={isSaved} loading={loading}
            onRegenerate={() => generate(Math.floor(Math.random() * 1e9))}
            onEdit={() => go('home')} onSave={save} onCopy={copy}
            onApply={(a) => { const next = { ...input, ...a }; setInput(next); generate(itinerary.seed, next); }}
            onNew={() => { setInput(DEFAULT_INPUT); setItinerary(null); setErrors({}); go('home'); }}
          />
        )}
        {page === 'results' && !itinerary && (
          <div className="container"><div className="card empty"><p>No itinerary yet.</p><button className="btn primary" onClick={() => go('home')}>Plan a trip</button></div></div>
        )}
      </main>
      <footer className="footer">Travel Ease · Prices are illustrative estimates, not live data.</footer>
    </>
  );
}
