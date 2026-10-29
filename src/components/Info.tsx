export function HowItWorks() {
  const steps = [
    ['1. Tell us about your trip', 'Choose a destination, budget, duration, group size, interests and style.'],
    ['2. We score the options', 'Every attraction is scored on interest match, affordability, pace and suitability.'],
    ['3. Get a day-by-day plan', 'Morning, afternoon and evening activities with meals, costs and map links.'],
    ['4. Check the budget', 'See a full cost breakdown, warnings if you are over budget, and cheaper alternatives.'],
  ];
  return (
    <section className="container">
      <h1>How It Works</h1>
      <div className="cards">{steps.map(([t, d]) => <article className="card" key={t}><h3>{t}</h3><p>{d}</p></article>)}</div>
    </section>
  );
}

export function About() {
  return (
    <section className="container narrow">
      <h1>About Travel Ease</h1>
      <p>Travel Ease creates personalized itineraries so that two people visiting the same destination can get very different plans based on their budget and interests.</p>
      <p>The planner works offline from a local dataset. When a Gemini API key is configured on the server, Gemini adds natural-language overviews and tips, which are validated before display.</p>
      <p className="muted">All prices are illustrative sample estimates. Travel Ease does not check live prices, availability, weather or routes. Always confirm details before booking.</p>
    </section>
  );
}
