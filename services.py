"""Travel services: emergency numbers, flight/train/bus suggestions, where to stay and trip essentials.

No live prices or availability are used. We build search links (Google Flights, IRCTC, Booking.com, ...) and
planning suggestions from the local dataset. Emergency numbers are reference data: verify before you travel.
"""
import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import quote, urlencode

_DATA = Path(__file__).parent / "data"


def _load(name):
    with open(_DATA / name, encoding="utf-8") as f:
        return json.load(f)


INFO = _load("travel_info.json")  # per destination id
COUNTRIES = _load("countries.json")  # per ISO country code

MAPS = "https://www.google.com/maps/search/?api=1&query="
MEA_MISSIONS = "https://www.mea.gov.in/indian-missions-abroad-new.htm"
MADAD = "https://madad.gov.in/"
EMERGENCY_DISCLAIMER = "Emergency numbers are reference data and can change. Verify them before you travel."


def _parse_date(s):
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _link(label, url):
    return dict(label=label, url=url)


def _country_code(dest):
    return dest.get("countryCode", "IN")


def emergency_for(dest):
    cc = _country_code(dest)
    c = COUNTRIES[cc]
    e = c["emergency"]
    place = f"{dest['name']}, {c['name']}"
    out = dict(
        country=c["name"], countryCode=cc, general=e["general"], numbers=e["numbers"], note=e.get("note", ""),
        nearby=[
            _link("Hospitals near " + dest["name"], MAPS + quote("hospital in " + place, safe="")),
            _link("Police stations", MAPS + quote("police station in " + place, safe="")),
            _link("Pharmacies", MAPS + quote("pharmacy in " + place, safe="")),
        ],
        disclaimer=EMERGENCY_DISCLAIMER,
    )
    if cc != "IN":
        out["embassy"] = dict(
            title="If you are an Indian citizen abroad",
            text=("Contact the Indian Embassy/High Commission or Consulate in " + c["name"] + " for a lost or stolen passport, "
                  "arrest, serious illness or a crisis. Save its number and address before you leave."),
            links=[
                _link("Indian missions abroad (MEA)", MEA_MISSIONS),
                _link("MADAD: consular help portal", MADAD),
                _link("Find the Indian Embassy on Maps", MAPS + quote("Indian Embassy " + c["name"], safe="")),
            ],
        )
    return out


def _flight_query(dest, info, start_city, start, days):
    # airport strings look like "Dubai International (DXB); ..." or "Cochin (COK) ~110 km": pull the first IATA code
    m = re.search(r"\(([A-Z]{3})\)", info["airport"])
    code = m.group(1) if m else dest["name"]
    q = f"Flights to {code}" + (f" from {start_city}" if start_city else "")
    if start:
        q += f" on {start.isoformat()} through {(start + timedelta(days=max(days - 1, 0))).isoformat()}"
    return code, "https://www.google.com/travel/flights?" + urlencode({"q": q, "curr": "INR"})


def travel_options(dest, inp, costs):
    info = INFO[dest["id"]]
    intl = dest.get("region") == "international"
    style = inp.get("style", "balanced")
    start_city = (inp.get("startCity") or "").strip()
    start = _parse_date(inp.get("startDate"))
    days = int(inp.get("days", 4))
    code, flights_url = _flight_query(dest, info, start_city, start, days)
    name = dest["name"]

    flight_links = [
        _link("Google Flights", flights_url),
        _link("Skyscanner", "https://www.skyscanner.co.in/"),
        _link("MakeMyTrip flights", "https://www.makemytrip.com/flights/"),
    ]
    modes = []
    if intl:
        modes.append(dict(
            mode="flight", icon="✈️", title=f"Fly to {name} ({code})",
            detail=f"Airport: {info['airport']}.",
            suggestion={"budget": "Look for low-cost carriers and 1-stop itineraries; fly on weekdays; set fare alerts.",
                        "balanced": "Compare 1-stop and nonstop fares; checked baggage is often extra on budget fares.",
                        "comfort": "Prefer nonstop full-service flights with baggage included, and a flexible/refundable fare."}[style],
            links=flight_links))
    else:
        modes.append(dict(
            mode="flight", icon="✈️", title=f"Fly to {name} ({code})",
            detail=f"Airport: {info['airport']}.",
            suggestion="Best for long distances or limited time. Compare low-cost and full-service fares; book about 3–8 weeks ahead for better prices.",
            links=flight_links))
        if info.get("railhead"):
            modes.append(dict(
                mode="train", icon="🚆", title=f"Train to {name}",
                detail=f"Nearest railhead: {info['railhead']}.",
                suggestion={"budget": "Sleeper or 3AC is the cheapest comfortable option; book as soon as the window opens (~60 days ahead).",
                            "balanced": "3AC or 2AC overnight trains save a hotel night; check Vande Bharat/Rajdhani-type services on your route.",
                            "comfort": "2AC/1AC or a premium chair-car service for day trains; book early."}[style],
                links=[_link("IRCTC Rail Connect", "https://www.irctc.co.in/nget/train-search"), _link("ixigo trains", "https://www.ixigo.com/trains")]))
        modes.append(dict(
            mode="bus", icon="🚌", title="Bus or road transfer",
            detail="Useful for hill stations and where there is no direct train. Overnight Volvo/sleeper buses save a hotel night.",
            suggestion="Check recent reviews and boarding point before booking.",
            links=[_link("RedBus", "https://www.redbus.in/")]))

    intercity = costs["intercity"] if costs else None
    per_person = intercity // max(inp.get("travellers", 1), 1) if intercity else None
    plan = []
    if per_person:
        plan.append(f"The plan assumes about ₹{per_person:,} per person return for getting to {name} ({style} style). Compare against live fares before booking.")
    if intl:
        plan.append("Book international flights 2–3 months ahead where possible, and keep passport validity of at least 6 months beyond your return date.")
        plan.append("Check baggage allowance and the transit visa rules if you have a layover in another country.")
    else:
        plan.append("Reserve return travel at the same time, since peak-season trains and flights to hill stations and beaches fill quickly.")
    return dict(
        gateway=dict(airport=info["airport"], railhead=info.get("railhead")),
        modes=modes, planNote=plan,
        disclaimer="Links open live search pages on other sites. Fares and timetables shown there are not part of Travel Ease.")


def stay_options(dest, inp, costs):
    info = INFO[dest["id"]]
    name = dest["name"]
    n = int(inp.get("travellers", 1))
    start = _parse_date(inp.get("startDate"))
    days = int(inp.get("days", 4))
    rooms = -(-n // 2)
    q = {"ss": name + (", " + dest["country"] if dest.get("country") else ""), "group_adults": n, "no_rooms": rooms}
    if start:
        q["checkin"] = start.isoformat()
        q["checkout"] = (start + timedelta(days=max(days - 1, 1))).isoformat()
    links = [
        _link("Google Hotels", "https://www.google.com/travel/search?" + urlencode({"q": f"hotels in {name}", "curr": "INR"})),
        _link("Booking.com", "https://www.booking.com/searchresults.html?" + urlencode(q)),
        _link("MakeMyTrip hotels", "https://www.makemytrip.com/hotels/"),
    ]
    acc = inp.get("accommodation", "any")
    style = inp.get("style", "balanced")
    out = dict(areas=info["stayAreas"], links=links, rooms=rooms)
    if costs:
        out["nightlyTarget"] = costs["stayNight"]
        out["nightlyNote"] = (f"The plan budgets about ₹{costs['stayNight']:,} per night for {rooms} room(s) "
                              f"({'any type of stay' if acc == 'any' else acc + ' stay'}, {style} style).")
    out["tips"] = [
        "Filter by free cancellation, review score 8+, and distance to the main sights or a metro/rail station.",
        "Staying near public transport usually saves more on local travel than a cheaper room far away.",
    ]
    if dest.get("region") == "international":
        out["tips"].append("Check whether the price includes taxes and any city/tourist tax charged at the hotel (common in Europe, Dubai, Japan).")
    else:
        out["tips"].append("Homestays and guesthouses can be good value outside peak season; confirm check-in times for night trains.")
    return out


def essentials(dest):
    info = INFO[dest["id"]]
    c = COUNTRIES[_country_code(dest)]
    intl = dest.get("region") == "international"
    e = dict(bestTime=info["bestTime"], currency=c["currency"], plug=c["plug"], language=c["language"],
             apps=c["apps"], tips=c["tips"])
    if intl:
        e["visa"] = dict(summary=c["visa"], url=c["visaUrl"])
        e["checklist"] = [
            "Passport valid for 6+ months, with blank pages",
            "Visa / e-visa / arrival form completed (check the official site)",
            "Travel insurance covering medical, baggage and trip cancellation",
            "Forex card or some local currency, plus a card that works abroad",
            "eSIM or local SIM, or an international roaming pack",
            "Copies of passport, visa and tickets saved offline and in email",
            "Prescriptions and a basic medicine kit, with the doctor's note",
            "Emergency numbers and the Indian Embassy contact saved offline",
        ]
        e["extras"] = [
            _link("Travel insurance: compare policies", "https://www.google.com/search?" + urlencode({"q": "travel insurance for Indians visiting " + dest["country"]})),
            _link("eSIM for " + dest["country"], "https://www.google.com/search?" + urlencode({"q": "best eSIM " + dest["country"] + " tourists"})),
            _link("Forex card rates", "https://www.google.com/search?" + urlencode({"q": "forex card for " + dest["country"]})),
        ]
    else:
        e["checklist"] = [
            "Government photo ID (original and a digital copy)",
            "Train/flight tickets and hotel confirmations saved offline",
            "Offline maps downloaded for the area",
            "Some cash, since UPI/network can be patchy in remote places",
            "Basic medicines, power bank and weather-appropriate clothing",
            "Emergency numbers saved (112, tourist helpline 1363)",
        ]
        e["extras"] = [_link("Weather forecast", "https://www.google.com/search?" + urlencode({"q": f"weather in {dest['name']}"}))]
    return e


def build(dest, inp, costs=None):
    """Everything extra for a trip: emergency, travel, stay, essentials. `costs` is the generator's cost_model dict."""
    return dict(
        region=dest.get("region", "domestic"), destinationId=dest["id"], destinationName=dest["name"],
        country=dest.get("country", "India"),
        emergency=emergency_for(dest), travel=travel_options(dest, inp, costs),
        stay=stay_options(dest, inp, costs), essentials=essentials(dest),
    )


def all_emergency():
    """Emergency numbers for every country in the dataset (India first)."""
    out = []
    for cc, c in sorted(COUNTRIES.items(), key=lambda kv: (kv[0] != "IN", kv[1]["name"])):
        out.append(dict(countryCode=cc, country=c["name"], **c["emergency"]))
    return dict(countries=out, disclaimer=EMERGENCY_DISCLAIMER)
