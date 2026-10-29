import type { Alternative, Itinerary, TripInput } from '../types';
import { dayDate, inr } from '../lib/format';

const COLORS = ['#0e9aa7', '#f77f00', '#0b2545', '#6cc3a0', '#e0b04b', '#9a8cc4'];

interface Props {
  it: Itinerary;
  input: TripInput;
  saved: boolean;
  loading: boolean;
  onRegenerate: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCopy: () => void;
  onNew: () => void;
  onApply: (a: Alternative['apply']) => void;
}

export default function Results({ it, input, saved, loading, onRegenerate, onEdit, onSave, onCopy, onNew, onApply }: Props) {
  const b = it.budget;
  return (
    <section className="container results">
      <div className="card summary">
        <div>
          <h1>{it.destinationName} itinerary</h1>
          <p>{it.summary}</p>
          {it.ai && <p className="ai"><strong>AI overview:</strong> {it.ai.overview}</p>}
          <p className="muted">Planner: {it.source === 'gemini' ? 'Gemini-enhanced wording on top of rule-based plan' : 'Rule-based planner (local dataset)'}</p>
        </div>
        <div className="stats">
          <div><span>Duration</span><b>{input.days} day{input.days > 1 ? 's' : ''}</b></div>
          <div><span>Travellers</span><b>{input.travellers}</b></div>
          <div><span>Estimated total</span><b>{inr(b.total)}</b></div>
          <div><span>Your budget</span><b>{inr(b.budget)}</b></div>
        </div>
      </div>

      <div className="actions">
        <button className="btn primary" onClick={onRegenerate} disabled={loading}>{loading ? 'Working…' : 'Regenerate Itinerary'}</button>
        <button className="btn" onClick={onEdit}>Edit Trip Details</button>
        <button className="btn" onClick={onSave}>{saved ? 'Saved ✓ (update)' : 'Save Trip'}</button>
        <button className="btn" onClick={onCopy}>Copy Itinerary</button>
        <button className="btn" onClick={onNew}>Start New Trip</button>
      </div>

      <div className={'banner ' + (b.withinBudget ? 'ok' : 'warn')} role="status">
        {b.withinBudget
          ? `Within budget: about ${inr(b.remaining)} remaining.`
          : `⚠ ${it.warning}`}
      </div>

      <div className="two-col">
        <div>
          <h2>Day-by-day plan</h2>
          {it.days.map((d) => (
            <article className="card day" key={d.day}>
              <header>
                <h3>Day {d.day}{dayDate(input.startDate, d.day) ? ` · ${dayDate(input.startDate, d.day)}` : ''} · {d.theme}</h3>
                <span className="price">{inr(d.costs.total)}</span>
              </header>
              {d.activities.map((a) => (
                <details className="activity" key={a.attractionId}>
                  <summary>
                    <span className="time">{a.time} · {a.slot}</span>
                    <strong>{a.name}</strong>
                    <span className="muted">~{a.hours}h · {a.totalCost ? inr(a.totalCost) : 'Free'}</span>
                  </summary>
                  <p>{a.desc}</p>
                  <p><em>Why it fits:</em> {a.reason}</p>
                  <p className="muted">{a.transport}. {a.costPerPerson ? `${inr(a.costPerPerson)} per person (illustrative).` : ''}</p>
                  <a href={a.mapsUrl} target="_blank" rel="noreferrer">Search on Google Maps ↗</a>
                </details>
              ))}
              <ul className="meals">{d.meals.map((m) => <li key={m.type}><b>{m.type}:</b> {m.suggestion}</li>)}</ul>
              <p className="muted small">
                Day costs: activities {inr(d.costs.activities)} · food {inr(d.costs.food)} · local transport {inr(d.costs.local)} · stay {inr(d.costs.stay)}
              </p>
            </article>
          ))}
        </div>

        <aside>
          <div className="card">
            <h2>Budget breakdown</h2>
            <div className="bar" role="img" aria-label="Expense breakdown">
              {b.lines.map((l, i) => <span key={l.key} style={{ width: `${(l.total / b.total) * 100}%`, background: COLORS[i] }} title={l.label} />)}
            </div>
            <table>
              <tbody>
                {b.lines.map((l, i) => (
                  <tr key={l.key}>
                    <td><i className="dot" style={{ background: COLORS[i] }} />{l.label}<div className="muted small">{l.note}</div></td>
                    <td className="num">{inr(l.total)}<div className="muted small">{inr(l.perPerson)}/person</div></td>
                  </tr>
                ))}
                <tr className="total"><td>Total estimate</td><td className="num">{inr(b.total)}<div className="muted small">{inr(b.perPersonTotal)}/person</div></td></tr>
                <tr><td>Your budget</td><td className="num">{inr(b.budget)}</td></tr>
                <tr><td>{b.remaining >= 0 ? 'Remaining' : 'Over budget by'}</td><td className={'num ' + (b.remaining >= 0 ? 'good' : 'bad')}>{inr(Math.abs(b.remaining))}</td></tr>
              </tbody>
            </table>
            <p className="muted small">Includes: travel, stay, food, local transport, tickets, 8% contingency. Excludes: shopping, insurance, visas, personal items.</p>
          </div>

          <div className="card">
            <h2>Budget-friendly alternatives</h2>
            {it.alternatives.length === 0 && <p className="muted">This plan is already close to the lowest-cost option for your inputs.</p>}
            {it.alternatives.map((a) => (
              <div className="alt" key={a.title}>
                <b>{a.title}</b> <span className="good">saves ~{inr(a.saving)}</span>
                <p className="muted small">{a.detail} New estimate: {inr(a.estimatedTotal)}{a.estimatedTotal <= b.budget ? ' (fits your budget)' : ' (still above budget)'}.</p>
                <button className="btn" onClick={() => onApply(a.apply)} disabled={loading}>Apply this option</button>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Why this plan?</h2>
            <ul>{it.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            {it.ageNotes.length > 0 && <><h3>Comfort & safety notes</h3><ul>{it.ageNotes.map((r) => <li key={r}>{r}</li>)}</ul></>}
            {it.ai && it.ai.tips.length > 0 && <><h3>AI tips</h3><ul>{it.ai.tips.map((r) => <li key={r}>{r}</li>)}</ul></>}
          </div>
          <p className="muted small">{it.disclaimer}</p>
        </aside>
      </div>
    </section>
  );
}
