import type { SavedTrip } from '../types';
import { inr } from '../lib/format';

interface Props { trips: SavedTrip[]; onOpen: (t: SavedTrip) => void; onDelete: (id: string) => void; onStart: () => void }

export default function MyTrips({ trips, onOpen, onDelete, onStart }: Props) {
  return (
    <section className="container">
      <h1>My Trips</h1>
      {trips.length === 0 ? (
        <div className="card empty">
          <p>🧳 You haven’t saved any trips yet.</p>
          <button className="btn primary" onClick={onStart}>Plan your first trip</button>
        </div>
      ) : (
        <div className="cards">
          {trips.map((t) => (
            <article className="card" key={t.id}>
              <h3>{t.itinerary.destinationName}</h3>
              <p>{t.itinerary.summary}</p>
              <p className="muted small">Saved {new Date(t.savedAt).toLocaleString()}</p>
              <p><b>{inr(t.itinerary.budget.total)}</b> estimated · budget {inr(t.input.budget)}{' '}
                <span className={t.itinerary.budget.withinBudget ? 'good' : 'bad'}>{t.itinerary.budget.withinBudget ? '✓ within budget' : '⚠ over budget'}</span></p>
              <div className="actions">
                <button className="btn primary" onClick={() => onOpen(t)}>View</button>
                <button className="btn danger" onClick={() => { if (window.confirm('Delete this saved trip?')) onDelete(t.id); }}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
