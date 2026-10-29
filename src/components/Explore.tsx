import { DESTINATIONS } from '../data/destinations';
import { inr } from '../lib/format';

export default function Explore({ onPlan }: { onPlan: (id: string) => void }) {
  return (
    <section className="container">
      <h1>Explore Destinations</h1>
      <p className="muted">Budget ranges are illustrative per-person daily estimates (stay share + food + local transport), not verified prices.</p>
      <div className="cards">
        {DESTINATIONS.map((d) => {
          const low = d.food.budget + d.stay.budget / 2 + d.local.budget / 4;
          const high = d.food.comfort + d.stay.comfort / 2 + d.local.comfort / 4;
          return (
            <article className="card dest" key={d.id}>
              <div className="dest-img" style={{ background: d.gradient }} aria-hidden="true"><span>{d.emoji}</span></div>
              <h3>{d.name}, <small>{d.state}</small></h3>
              <p>{d.tagline}</p>
              <p className="muted small"><b>Best for:</b> {d.bestFor.join(', ')}</p>
              <p className="muted small"><b>Top attractions:</b> {d.attractions.slice(0, 3).map((a) => a.name).join(', ')}</p>
              <p><b>{inr(low)} – {inr(high)}</b> <span className="muted small">per person / day (illustrative)</span></p>
              <button className="btn primary" onClick={() => onPlan(d.id)}>Plan a trip to {d.name}</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
