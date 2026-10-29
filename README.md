# Travel Ease — AI-Powered Personalized Travel Itinerary Planner

React + TypeScript (Vite) frontend, Node + Express backend, optional Gemini enhancement, localStorage for saved trips.

## Setup
1. Install Node.js 20+ and VS Code.
2. `npm install`
3. (Optional) put your key in `.env`: `GEMINI_API_KEY=...` (get one at https://aistudio.google.com/apikey). Without it the rule-based planner is used.
4. `npm run dev` then open http://localhost:5173

## Production
`npm run build` then `npm start` (serves the app and API on http://localhost:3001).

## Structure
- `server/index.ts` — Express API (`/api/generate`, `/api/health`), Gemini call, response validation
- `src/lib/generator.ts` — scoring, itinerary and budget logic (shared by server and browser fallback)
- `src/data/destinations.ts` — destination dataset (illustrative prices). Add destinations here.
- `src/components/` — Navbar, PlanForm, Results, Explore, MyTrips, Info
- `src/App.tsx` — page state, generate/save/copy/delete flows
