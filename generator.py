"""Rule-based itinerary + budget engine. Port of the original TypeScript generator.

All prices come from data/destinations.json and are illustrative estimates.
"""
import json
import math
import time
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import quote

import services

_DATA = Path(__file__).parent / "data"
DESTINATIONS = []
for _file, _region in (("destinations.json", "domestic"), ("international.json", "international")):
    with open(_DATA / _file, encoding="utf-8") as f:
        for _d in json.load(f):
            _d.setdefault("region", _region)
            _d.setdefault("country", "India")
            _d.setdefault("countryCode", "IN")
            _d.setdefault("visaPP", 0)
            _d.setdefault("insurancePPPerDay", 0)
            DESTINATIONS.append(_d)
_BY_ID = {d["id"]: d for d in DESTINATIONS}

INTERESTS = ["nature", "adventure", "beaches", "history", "culture", "food", "shopping", "relaxation", "sightseeing"]
DISCLAIMER = (
    "All prices are illustrative sample estimates for planning only. They are not verified current prices, "
    "and no live availability, weather, visa rules or routes were checked."
)
ACC_MULT = {"any": 1, "hostel": 0.55, "homestay": 0.8, "hotel": 1.1, "resort": 1.9}
INTERCITY_MULT = {"budget": 1, "balanced": 1.3, "comfort": 2}
SLOTS = {
    "relaxed": [("Morning", "10:00"), ("Evening", "17:00")],
    "balanced": [("Morning", "09:30"), ("Afternoon", "14:30"), ("Evening", "18:00")],
    "packed": [("Morning", "08:30"), ("Afternoon", "12:30"), ("Afternoon", "15:30"), ("Evening", "18:30")],
}
AGE_NOTES = {
    "under18": "For younger travellers: carry ID documents, stay with a guardian, and confirm age/weight rules with adventure operators.",
    "18-25": "Hostels, homestays and shared transport are good ways to stretch your budget.",
    "26-40": "Popular experiences can fill up on weekends; consider booking key activities in advance.",
    "41-60": "Short breaks between sights keep the trip comfortable; start busy days early.",
    "above60": "Comfortable pacing is suggested: fewer steep walks, medicines in hand baggage, and a check on step-free access at each site.",
}


def get_destination(dest_id):
    return _BY_ID.get(dest_id)


def js_round(x):
    """JS Math.round (half rounds up), not Python banker's rounding."""
    return int(math.floor(x + 0.5))


def inr(n):
    """Indian digit grouping, e.g. 1234567 -> 12,34,567."""
    n = js_round(n)
    sign = "-" if n < 0 else ""
    s = str(abs(n))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:])
            head = head[:-2]
        if head:
            parts.insert(0, head)
        s = ",".join(parts) + "," + tail
    return f"{sign}₹{s}"


def make_rng(seed):
    """mulberry32, identical stream to the original JS version."""
    M = 0xFFFFFFFF
    state = [int(seed) & M]

    def rand():
        a = (state[0] + 0x6D2B79F5) & M
        state[0] = a
        t = ((a ^ (a >> 15)) * (1 | a)) & M
        t = ((t + (((t ^ (t >> 7)) * (61 | t)) & M)) ^ t) & M
        return ((t ^ (t >> 14)) & M) / 4294967296

    return rand


def _is_int(x):
    if isinstance(x, bool):
        return False
    if isinstance(x, int):
        return True
    return isinstance(x, float) and x.is_integer()


def _is_num(x):
    return not isinstance(x, bool) and isinstance(x, (int, float)) and math.isfinite(x)


def validate_input(i):
    e = {}
    if not i.get("destinationId") or not get_destination(i.get("destinationId")):
        e["destinationId"] = "Please choose a destination from the list."
    if not i.get("age") or i.get("age") not in AGE_NOTES:
        e["age"] = "Please select an age group."
    if not _is_num(i.get("budget")) or i["budget"] < 1000:
        e["budget"] = "Enter a total budget of at least ₹1,000."
    if not _is_int(i.get("days")) or not 1 <= i["days"] <= 15:
        e["days"] = "Duration must be a whole number from 1 to 15 days."
    if not _is_int(i.get("travellers")) or not 1 <= i["travellers"] <= 20:
        e["travellers"] = "Travellers must be a whole number from 1 to 20."
    ints = i.get("interests")
    if not isinstance(ints, list) or not ints or any(x not in INTERESTS for x in ints):
        e["interests"] = "Pick at least one interest."
    sd = i.get("startDate")
    if sd:
        try:
            if datetime.strptime(sd, "%Y-%m-%d").date() < date.today():
                e["startDate"] = "Start date cannot be in the past."
        except (ValueError, TypeError):
            e["startDate"] = "Enter a valid start date."
    if i.get("style", "balanced") not in INTERCITY_MULT:
        e["style"] = "Invalid travel style."
    if i.get("pace", "balanced") not in SLOTS:
        e["pace"] = "Invalid pace."
    if i.get("accommodation", "any") not in ACC_MULT:
        e["accommodation"] = "Invalid accommodation."
    return e


def normalize(i):
    """Fill defaults and coerce numbers so the engine sees a clean dict."""
    out = dict(i)
    out["budget"] = float(i["budget"])
    out["days"] = int(i["days"])
    out["travellers"] = int(i["travellers"])
    out.setdefault("style", "balanced")
    out.setdefault("pace", "balanced")
    out.setdefault("accommodation", "any")
    out["accessibility"] = bool(i.get("accessibility"))
    out["freeOnly"] = bool(i.get("freeOnly"))
    out["startCity"] = (i.get("startCity") or "").strip()[:60]
    return out


def cost_model(d, inp, style, activities_total, days=None):
    days = inp["days"] if days is None else days
    n = inp["travellers"]
    nights = max(days - 1, 0)
    rooms = math.ceil(n / 2)
    stay_night = js_round(rooms * d["stay"][style] * ACC_MULT[inp["accommodation"]])
    stay = stay_night * nights
    food_day = d["food"][style] * n
    food = food_day * days
    local_day = d["local"][style] * math.ceil(n / 4)
    local = local_day * days
    intercity = js_round(d["intercityPP"] * INTERCITY_MULT[style]) * n
    visa = js_round(d.get("visaPP", 0) * n)
    insurance = js_round(d.get("insurancePPPerDay", 0) * n * days)
    subtotal = intercity + stay + food + local + activities_total + visa + insurance
    misc = js_round(subtotal * 0.08)
    return dict(n=n, nights=nights, stayNight=stay_night, stay=stay, foodDay=food_day, food=food,
                localDay=local_day, local=local, intercity=intercity, activities=activities_total,
                visa=visa, insurance=insurance, misc=misc, total=subtotal + misc)


def _age_notes(age, accessibility):
    notes = []
    if age:
        notes.append(AGE_NOTES[age])
    if accessibility:
        notes.append("Activities needing strenuous walking or climbing were left out. Please confirm accessibility with each venue.")
    return notes


def _score(a, inp, slot, allowance_left_pp, rand):
    if a["intense"] and inp["accessibility"]:
        return -math.inf
    if inp["freeOnly"] and a["costPerPerson"] > 0:
        return -math.inf
    s = sum(1 for c in a["categories"] if c in inp["interests"]) * 3
    if a["costPerPerson"] == 0:
        s += 1.5 if inp["style"] == "budget" else 0.5
    elif a["costPerPerson"] > allowance_left_pp:
        s -= 5
    if a["intense"] and inp.get("age") in ("above60", "under18"):
        s -= 2
    if a["intense"] and inp["pace"] == "relaxed":
        s -= 1
    if inp["pace"] == "relaxed" and a["hours"] > 4:
        s -= 1
    want = slot.lower()
    s += 1.5 if a["slot"] == want else (0 if a["slot"] == "any" else -1.5)
    return s + rand() * 1.2


def _label(c):
    return c[:1].upper() + c[1:]


def _base36(n):
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while n:
        n, r = divmod(n, 36)
        out = chars[r] + out
    return out or "0"


def generate_itinerary(inp, seed=None):
    if seed is None:
        seed = int(time.time() * 1000)
    seed = int(seed)
    dest = get_destination(inp["destinationId"])
    if not dest:
        raise ValueError("Unknown destination")
    rand = make_rng(seed)
    n = inp["travellers"]

    base = cost_model(dest, inp, inp["style"], 0)
    allowance_pp = max(0, (inp["budget"] - base["total"]) / 1.08 / n)
    spent_pp = 0
    used = set()
    days = []

    for day in range(1, inp["days"] + 1):
        activities = []
        for slot, t in SLOTS[inp["pace"]]:
            best, best_score = None, -math.inf
            for a in dest["attractions"]:
                if a["id"] in used:
                    continue
                s = _score(a, inp, slot, allowance_pp - spent_pp, rand)
                if s > best_score:
                    best, best_score = a, s
            if best:
                used.add(best["id"])
                spent_pp += best["costPerPerson"]
                matched = [c for c in best["categories"] if c in inp["interests"]]
                reason = (
                    f"Matches your interest in {' & '.join(_label(c) for c in matched).lower()}."
                    if matched else "Adds variety to your trip."
                )
                activities.append(dict(
                    attractionId=best["id"], name=best["name"], desc=best["desc"], slot=slot, time=t,
                    hours=best["hours"], costPerPerson=best["costPerPerson"], totalCost=best["costPerPerson"] * n,
                    categories=best["categories"],
                    reason=reason + (" Free to enjoy." if best["costPerPerson"] == 0 else ""),
                    transport=f"Suggested: {dest['transportTip']}",
                    mapsUrl="https://www.google.com/maps/search/?api=1&query=" + quote(best["name"] + " " + dest["name"], safe=""),
                    isFiller=False,
                ))
            else:
                activities.append(dict(
                    attractionId=f"filler-{day}-{slot}", name="Free time & local exploring",
                    desc=f"Unplanned time to wander, rest, shop or revisit a favourite spot in {dest['name']}.",
                    slot=slot, time=t, hours=2, costPerPerson=0, totalCost=0, categories=["relaxation"],
                    reason="All suitable attractions are already in your plan.",
                    transport="Walk or use local transport as needed",
                    mapsUrl="https://www.google.com/maps/search/?api=1&query=" + quote("markets in " + dest["name"], safe=""),
                    isFiller=True,
                ))
        counts = {}
        for a in activities:
            if not a["isFiller"]:
                for c in a["categories"]:
                    counts[c] = counts.get(c, 0) + 1
        top = sorted(counts.items(), key=lambda kv: -kv[1])[0][0] if counts else None
        m = dest["dishes"]
        days.append(dict(
            day=day, theme=f"{_label(top)} day" if top else "Easy day", activities=activities,
            meals=[
                dict(type="Breakfast", suggestion="Local breakfast near your stay"),
                dict(type="Lunch", suggestion=f"Try {m[(day - 1) % len(m)]} or a local thali"),
                dict(type="Dinner", suggestion=f"Try {m[day % len(m)]} at a well-reviewed local eatery"),
            ],
            costs=dict(activities=0, food=0, local=0, stay=0, total=0),
        ))

    act_total = sum(a["totalCost"] for d in days for a in d["activities"])
    c = cost_model(dest, inp, inp["style"], act_total)
    for d in days:
        act = sum(a["totalCost"] for a in d["activities"])
        stay = c["stayNight"] if d["day"] <= c["nights"] else 0
        d["costs"] = dict(activities=act, food=c["foodDay"], local=c["localDay"], stay=stay,
                          total=act + c["foodDay"] + c["localDay"] + stay)

    def pp(x):
        return js_round(x / n)

    budget = dict(
        lines=[
            dict(key="intercity", label="Intercity travel", total=c["intercity"], perPerson=pp(c["intercity"]),
                 note="Round trip, sample estimate from a major city. Per person × travellers."),
            dict(key="stay", label="Accommodation", total=c["stay"], perPerson=pp(c["stay"]),
                 note=f"{math.ceil(n / 2)} room(s) × {c['nights']} night(s); rooms assume 2 people each. Group cost shared."),
            dict(key="food", label="Food", total=c["food"], perPerson=pp(c["food"]), note="Three meals a day per person."),
            dict(key="local", label="Local transport", total=c["local"], perPerson=pp(c["local"]),
                 note="Shared per vehicle (up to 4 people per vehicle)."),
            dict(key="activities", label="Activities & tickets", total=c["activities"], perPerson=pp(c["activities"]),
                 note="Entry fees and paid experiences in your plan."),
            *([dict(key="visa", label="Visa & travel insurance", total=c["visa"] + c["insurance"],
                    perPerson=pp(c["visa"] + c["insurance"]),
                    note="Estimated visa/e-visa fee plus basic travel insurance. Check official sites for exact fees.")]
              if dest["region"] == "international" else []),
            dict(key="misc", label="Miscellaneous & contingency (8%)", total=c["misc"], perPerson=pp(c["misc"]),
                 note="Tips, shopping, small unexpected costs."),
        ],
        total=c["total"], perPersonTotal=pp(c["total"]), budget=inp["budget"],
        remaining=inp["budget"] - c["total"], withinBudget=c["total"] <= inp["budget"],
    )

    alts = []

    def add(title, detail, total, apply):
        if c["total"] - total > 0:
            alts.append(dict(title=title, detail=detail, estimatedTotal=total, saving=c["total"] - total, apply=apply))

    free = ", ".join(a["name"] for a in [x for x in dest["attractions"] if x["costPerPerson"] == 0][:4])
    if inp["style"] != "budget":
        add("Switch to budget style", "Budget hotels/guesthouses, simpler meals and shared transport.",
            generate_itinerary({**inp, "style": "budget"}, seed)["budget"]["total"], {"style": "budget"})
    if not inp["freeOnly"]:
        add("Choose free attractions only", f"Skip paid tickets. Free options include: {free or 'local markets and viewpoints'}.",
            cost_model(dest, inp, inp["style"], 0)["total"], {"freeOnly": True})
    if not inp["freeOnly"] and inp["style"] != "budget":
        add("Budget style + free attractions", "The cheapest combination of the options above.",
            cost_model(dest, inp, "budget", 0)["total"], {"style": "budget", "freeOnly": True})
    if inp["days"] > 1:
        add(f"Shorten the trip to {inp['days'] - 1} day(s)", "Removes one day of stay, food, transport and activities.",
            generate_itinerary({**inp, "days": inp["days"] - 1}, seed)["budget"]["total"], {"days": inp["days"] - 1})

    warning = None
    if not budget["withinBudget"]:
        cheapest = cost_model(dest, inp, "budget", 0)["total"]
        warning = (
            f"Estimated cost {inr(c['total'])} is {inr(c['total'] - inp['budget'])} over your budget of {inr(inp['budget'])}. "
            "See the lower-cost alternatives below."
        )
        if cheapest > inp["budget"]:
            warning += " Even the cheapest option here exceeds your budget, so consider fewer days, fewer travellers, or a higher budget."

    reasons = [
        f"Activities were ranked by how many of your interests ({', '.join(_label(i) for i in inp['interests'])}) they match.",
        f"{_label(inp['style'])} travel style sets the stay, food and transport estimates.",
        f"A {inp['pace']} pace gives {len(SLOTS[inp['pace']])} activity slot(s) per day.",
        "Your budget leaves little room for paid activities, so free attractions were favoured."
        if allowance_pp <= 0 else "Paid attractions were chosen only while they fit the remaining budget.",
    ]

    if dest["region"] == "international":
        reasons.append("International trip: the estimate includes a visa fee and travel insurance. Passport validity and visa rules must be checked on official sites.")
    start_city = f" from {inp['startCity']}" if inp.get("startCity") else ""
    return dict(
        id=f"trip-{seed}-{_base36(int(time.time() * 1000))}",
        createdAt=datetime.now(timezone.utc).isoformat(), seed=seed,
        destinationId=dest["id"], destinationName=dest["name"],
        summary=f"{inp['days']}-day {inp['style']} trip to {dest['name']} for {n} traveller{'s' if n > 1 else ''}{start_city}.",
        reasons=reasons, ageNotes=_age_notes(inp.get("age"), inp["accessibility"]), days=days, budget=budget,
        alternatives=alts, warning=warning, source="rule-based", disclaimer=DISCLAIMER,
        region=dest["region"], services=services.build(dest, inp, c),
    )
