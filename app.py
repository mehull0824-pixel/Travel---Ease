"""Travel Ease — Flask API + static frontend, optional Gemini wording enhancement."""
import json
import os
import re
import time

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

import generator as gen
import services as svc

load_dotenv()

KEY = os.getenv("GEMINI_API_KEY")  # stays on the server, never sent to the browser
# "-latest" alias always points at Google's newest Flash model; override in .env to pin a version.
MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
PORT = int(os.getenv("PORT", "3001"))

app = Flask(__name__, static_folder="static", static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024


def _is_str(x, mx):
    return isinstance(x, str) and 0 < len(x) <= mx


def _valid_ai(x, days):
    return (
        isinstance(x, dict)
        and _is_str(x.get("overview"), 800)
        and isinstance(x.get("dayThemes"), list)
        and len(x["dayThemes"]) == days
        and all(_is_str(t, 80) for t in x["dayThemes"])
        and isinstance(x.get("tips"), list)
        and all(_is_str(t, 250) for t in x["tips"])
    )


def enhance(it, inp):
    """Ask Gemini for wording only (overview, day themes, tips). Prices and places stay from our dataset."""
    if not KEY:
        return it
    plan = [{"day": d["day"], "activities": [a["name"] for a in d["activities"]]} for d in it["days"]]
    prompt = (
        f"You are a travel writer. Trip: {it['summary']} Interests: {', '.join(inp['interests'])}. "
        f"Age group: {inp.get('age')}. Pace: {inp['pace']}.\n"
        f"Plan (do not change it): {json.dumps(plan)}\n"
        f'Return ONLY JSON: {{"overview": string (max 80 words), "dayThemes": string[] (exactly {len(it["days"])}, '
        f'each max 6 words), "tips": string[] (max 4 short practical tips)}}.\n'
        "Do not mention prices, weather, live availability or exact distances. Do not add places not in the plan."
    )
    try:
        r = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
            headers={"Content-Type": "application/json", "x-goog-api-key": KEY},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json", "temperature": 0.7},
            },
            timeout=30,
        )
        if not r.ok:
            raise RuntimeError(f"Gemini HTTP {r.status_code}")
        parts = r.json()["candidates"][0]["content"]["parts"]
        # thinking models may emit thought parts first; take the last text part
        text = [p["text"] for p in parts if "text" in p and not p.get("thought")][-1]
        parsed = json.loads(re.sub(r"```json|```", "", text).strip())
        if not _valid_ai(parsed, len(it["days"])):
            raise ValueError("Malformed Gemini response")
        for d, theme in zip(it["days"], parsed["dayThemes"]):
            d["theme"] = theme
        it["ai"] = {"overview": parsed["overview"], "tips": parsed["tips"][:4]}
        it["source"] = "gemini"
    except Exception as err:  # noqa: BLE001 - any failure falls back to rule-based
        print(f"Gemini unavailable, using rule-based itinerary: {err}")
    return it


@app.get("/api/health")
def health():
    return jsonify(ok=True, gemini=bool(KEY), model=MODEL if KEY else None)


@app.get("/api/destinations")
def destinations():
    return jsonify(destinations=gen.DESTINATIONS, interests=gen.INTERESTS)  # each has region: domestic | international


def _int_arg(name, default, lo, hi):
    try:
        v = int(request.args.get(name, default))
    except (TypeError, ValueError):
        return default
    return min(max(v, lo), hi)


@app.get("/api/services/<dest_id>")
def services_for(dest_id):
    """Emergency numbers, flight/train/bus + stay suggestions and essentials for one destination."""
    dest = gen.get_destination(dest_id)
    if not dest:
        return jsonify(error="Unknown destination."), 404
    style = request.args.get("style", "balanced")
    acc = request.args.get("accommodation", "any")
    inp = {
        "destinationId": dest_id,
        "startCity": request.args.get("startCity", "").strip()[:60],
        "startDate": request.args.get("startDate", ""),
        "days": _int_arg("days", 4, 1, 15),
        "travellers": _int_arg("travellers", 2, 1, 20),
        "style": style if style in gen.INTERCITY_MULT else "balanced",
        "accommodation": acc if acc in gen.ACC_MULT else "any",
    }
    costs = gen.cost_model(dest, inp, inp["style"], 0)
    return jsonify(services=svc.build(dest, inp, costs))


@app.get("/api/emergency")
def emergency():
    return jsonify(svc.all_emergency())


@app.post("/api/generate")
def generate():
    body = request.get_json(silent=True) or {}
    inp = body.get("input")
    if not isinstance(inp, dict):
        return jsonify(errors={"form": "Missing trip details."}), 400
    seed = body.get("seed")
    seed = int(seed) if isinstance(seed, (int, float)) and not isinstance(seed, bool) else int(time.time() * 1000)
    errors = gen.validate_input(inp)
    if errors:
        return jsonify(errors=errors), 400
    try:
        clean = gen.normalize(inp)
        return jsonify(itinerary=enhance(gen.generate_itinerary(clean, seed), clean))
    except Exception as err:  # noqa: BLE001
        app.logger.exception(err)
        return jsonify(error="Could not generate itinerary."), 500


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    print(f"Travel Ease on http://localhost:{PORT} (Gemini {MODEL if KEY else 'disabled — rule-based only'})")
    app.run(host="127.0.0.1", port=PORT, debug=os.getenv("FLASK_DEBUG") == "1")
