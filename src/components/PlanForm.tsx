import { useState } from 'react';
import { DESTINATIONS } from '../data/destinations';
import { INTERESTS } from '../lib/generator';
import { todayStr } from '../lib/format';
import type { AgeGroup, Interest, TripInput } from '../types';

interface Props {
  input: TripInput;
  setInput: (i: TripInput) => void;
  errors: Record<string, string>;
  loading: boolean;
  onSubmit: () => void;
}

const AGES: { v: AgeGroup; l: string }[] = [
  { v: 'under18', l: 'Under 18' }, { v: '18-25', l: '18–25' }, { v: '26-40', l: '26–40' },
  { v: '41-60', l: '41–60' }, { v: 'above60', l: 'Above 60' },
];

export default function PlanForm({ input, setInput, errors, loading, onSubmit }: Props) {
  const [q, setQ] = useState('');
  const set = <K extends keyof TripInput>(k: K, v: TripInput[K]) => setInput({ ...input, [k]: v });
  const matches = DESTINATIONS.filter((d) => `${d.name} ${d.state}`.toLowerCase().includes(q.trim().toLowerCase()));
  const toggle = (i: Interest) =>
    set('interests', input.interests.includes(i) ? input.interests.filter((x) => x !== i) : [...input.interests, i]);
  const err = (k: string) => (errors[k] ? <p className="field-error" role="alert">{errors[k]}</p> : null);

  return (
    <form className="card form" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit(); }} aria-label="Trip planning form">
      <h2>Plan your trip</h2>

      <fieldset>
        <legend>Destination *</legend>
        <input type="search" placeholder="Search destinations…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search destinations" />
        <div className="chips" role="radiogroup" aria-label="Destination">
          {matches.map((d) => (
            <button type="button" key={d.id} role="radio" aria-checked={input.destinationId === d.id}
              className={'chip' + (input.destinationId === d.id ? ' on' : '')} onClick={() => set('destinationId', d.id)}>
              {d.emoji} {d.name}
            </button>
          ))}
          {matches.length === 0 && <p className="muted">No destination matches “{q}”.</p>}
        </div>
        {err('destinationId')}
      </fieldset>

      <div className="grid2">
        <label>Starting city (optional)
          <input value={input.startCity} onChange={(e) => set('startCity', e.target.value)} placeholder="e.g. Delhi" />
        </label>
        <label>Age group *
          <select value={input.age} onChange={(e) => set('age', e.target.value as AgeGroup | '')}>
            <option value="">Select…</option>
            {AGES.map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}
          </select>
          {err('age')}
        </label>
        <label>Total budget (₹ INR) *
          <input type="number" min={1000} step={500} inputMode="numeric" value={input.budget || ''} onChange={(e) => set('budget', Number(e.target.value))} />
          {err('budget')}
        </label>
        <label>Duration (days) *
          <input type="number" min={1} max={15} value={input.days || ''} onChange={(e) => set('days', Number(e.target.value))} />
          {err('days')}
        </label>
        <label>Start date (optional)
          <input type="date" min={todayStr()} value={input.startDate ?? ''} onChange={(e) => set('startDate', e.target.value)} />
          {err('startDate')}
        </label>
        <label>Number of travellers *
          <input type="number" min={1} max={20} value={input.travellers || ''} onChange={(e) => set('travellers', Number(e.target.value))} />
          {err('travellers')}
        </label>
        <label>Travel style
          <select value={input.style} onChange={(e) => set('style', e.target.value as TripInput['style'])}>
            <option value="budget">Budget</option><option value="balanced">Balanced</option><option value="comfort">Comfort</option>
          </select>
        </label>
      </div>

      <fieldset>
        <legend>Interests * (choose one or more)</legend>
        <div className="chips">
          {INTERESTS.map((i) => (
            <label key={i} className={'chip' + (input.interests.includes(i) ? ' on' : '')}>
              <input type="checkbox" checked={input.interests.includes(i)} onChange={() => toggle(i)} />
              {i.charAt(0).toUpperCase() + i.slice(1)}
            </label>
          ))}
        </div>
        {err('interests')}
      </fieldset>

      <details className="optional">
        <summary>Optional preferences</summary>
        <div className="grid2">
          <label>Schedule
            <select value={input.pace} onChange={(e) => set('pace', e.target.value as TripInput['pace'])}>
              <option value="relaxed">Relaxed</option><option value="balanced">Balanced</option><option value="packed">Packed</option>
            </select>
          </label>
          <label>Accommodation
            <select value={input.accommodation} onChange={(e) => set('accommodation', e.target.value as TripInput['accommodation'])}>
              <option value="any">No preference</option><option value="hostel">Hostel</option><option value="homestay">Homestay</option>
              <option value="hotel">Hotel</option><option value="resort">Resort</option>
            </select>
          </label>
        </div>
        <label className="check">
          <input type="checkbox" checked={input.accessibility} onChange={(e) => set('accessibility', e.target.checked)} />
          I need accessibility-friendly activities (avoids strenuous treks)
        </label>
        <label className="check">
          <input type="checkbox" checked={!!input.freeOnly} onChange={(e) => set('freeOnly', e.target.checked)} />
          Free attractions only (no paid tickets)
        </label>
      </details>

      <button className="btn primary big" type="submit" disabled={loading}>
        {loading ? 'Generating…' : 'Generate My Trip'}
      </button>
    </form>
  );
}
