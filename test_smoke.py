"""Quick checks for data and API. Run: python -m unittest test_smoke -v"""
import unittest

import app as appmod
import generator as gen
import services as svc


class Smoke(unittest.TestCase):
    def setUp(self):
        self.c = appmod.app.test_client()

    def test_every_destination_is_complete(self):
        self.assertGreaterEqual(len([d for d in gen.DESTINATIONS if d["region"] == "international"]), 10)
        for d in gen.DESTINATIONS:
            self.assertIn(d["id"], svc.INFO, d["id"])
            self.assertIn(d["countryCode"], svc.COUNTRIES, d["id"])
            self.assertTrue(d["attractions"], d["id"])
            self.assertTrue(svc.INFO[d["id"]]["stayAreas"], d["id"])
        ids = [d["id"] for d in gen.DESTINATIONS]
        self.assertEqual(len(ids), len(set(ids)), "duplicate destination ids")

    def test_generate_all_destinations(self):
        for d in gen.DESTINATIONS:
            inp = gen.normalize(dict(destinationId=d["id"], age="26-40", budget=300000, days=5, travellers=2,
                                     interests=["culture", "food"], startCity="Delhi", startDate="2030-01-10"))
            it = gen.generate_itinerary(inp, 1)
            self.assertEqual(it["region"], d["region"])
            keys = {l["key"] for l in it["budget"]["lines"]}
            self.assertEqual("visa" in keys, d["region"] == "international")
            self.assertAlmostEqual(sum(l["total"] for l in it["budget"]["lines"]), it["budget"]["total"], delta=1)
            sv = it["services"]
            self.assertTrue(sv["emergency"]["numbers"])
            self.assertTrue(sv["travel"]["modes"])
            self.assertEqual(("embassy" in sv["emergency"]), d["region"] == "international")

    def test_endpoints(self):
        r = self.c.get("/api/services/paris?startCity=Delhi&days=6&travellers=3&style=comfort")
        self.assertEqual(r.status_code, 200)
        sv = r.get_json()["services"]
        self.assertEqual(sv["emergency"]["general"], "112")
        self.assertEqual(self.c.get("/api/services/nope").status_code, 404)
        self.assertEqual(self.c.get("/api/services/goa?days=abc&style=x").status_code, 200)
        em = self.c.get("/api/emergency").get_json()
        self.assertEqual(em["countries"][0]["countryCode"], "IN")
        r = self.c.post("/api/generate", json={"input": dict(destinationId="bali", age="18-25", budget=150000, days=4, travellers=2,
                                                              interests=["nature"]), "seed": 5})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.get_json()["itinerary"]["region"], "international")


if __name__ == "__main__":
    unittest.main()
