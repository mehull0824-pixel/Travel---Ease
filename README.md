# Travel Ease — Personalized Travel Itinerary Planner

Python (Flask) backend + plain HTML/CSS/JavaScript frontend (no build step). Optional Gemini wording enhancement. Saved trips live in browser localStorage.

## Setup
1. Python 3.10+
2. `python -m venv .venv && source .venv/bin/activate` (Windows: `.venv\Scripts\activate`)
3. `pip install -r requirements.txt`
4. (Optional) copy `.env.example` to `.env`, set `GEMINI_API_KEY=...` (https://aistudio.google.com/apikey). Without it the rule-based planner is used.
5. `python app.py` → open http://localhost:3001

`GEMINI_MODEL` defaults to `gemini-flash-latest` (Google alias → newest Flash model). Pin a version in `.env` if wanted.

## Structure
- `app.py` — Flask API (`/api/generate`, `/api/destinations`, `/api/services/<id>`, `/api/emergency`, `/api/health`), Gemini call, response validation, serves `static/`
- `generator.py` — scoring, itinerary and budget logic
- `services.py` — emergency numbers, flight/train/bus suggestions (search links), where to stay, trip essentials
- `data/destinations.json` — India destinations (illustrative prices)
- `data/international.json` — 13 international destinations (same schema + `country`, `countryCode`, `visaPP`, `insurancePPPerDay`)
- `data/travel_info.json` — per destination: airport, railhead, best time, areas to stay
- `data/countries.json` — per country: emergency numbers, currency, plug, visa note, apps, tips
- `test_smoke.py` — `python -m unittest test_smoke -v`
- `static/index.html`, `static/css/styles.css`
- `static/js/` — `main.js` (state, events, API), `views.js` (HTML renderers), `format.js`, `storage.js`

## Adding a destination
1. Add it to `data/international.json` (or `destinations.json`) with a unique `id`.
2. Add an entry with the same `id` in `data/travel_info.json`.
3. For a new country, add its `countryCode` to `data/countries.json`. Run `python -m unittest test_smoke` to check nothing is missing.

Emergency numbers, visa notes and prices are reference data. Verify them on official sites before travelling.
