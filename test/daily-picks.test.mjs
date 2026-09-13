import assert from "node:assert/strict";
import test from "node:test";
import { fetchTourCollection } from "../netlify/functions/viator-tours.mjs";
import { browseMessage, dailyPickLandingUrl, liveTourMessage } from "../netlify/functions/_lib/facebook.mjs";
import { cleanHistory, isMiamiPublishingTime, miamiDateKey, selectDailyTour } from "../netlify/functions/_lib/miami-picks.mjs";

const NOW = new Date("2026-09-12T12:30:00.000Z");

const tours = [
  { code: "A1", title: "Everglades Airboat", category: "Everglades", url: "https://www.viator.com/tours/Miami/d662-A1", price: 49, currency: "USD", rating: 4.4, reviews: 3_000 },
  { code: "B2", title: "Little Havana Food Walk", category: "Little Havana", url: "https://www.viator.com/tours/Miami/d662-B2", price: 70, currency: "USD", rating: 4.9, reviews: 9_000 },
  { code: "C3", title: "Biscayne Bay Cruise", category: "Biscayne Bay", url: "https://www.viator.com/tours/Miami/d662-C3", price: 18, currency: "USD", rating: 4.3, reviews: 2_000 },
];

const product = (code, title) => ({
  productCode: code,
  title,
  productUrl: `https://www.viator.com/tours/Miami/d662-${code}`,
  images: [{ variants: [{ url: `https://images.example.test/${code}.jpg`, width: 720, height: 480 }] }],
  reviews: { combinedAverageRating: 4.5, totalReviews: 1_500 },
  pricing: { summary: { fromPrice: 55 }, currency: "USD" },
  duration: { fixedDurationInMinutes: 90 }
});

test("keeps the daily schedule at 8:30 AM Eastern through daylight saving time", () => {
  assert.equal(miamiDateKey(NOW), "2026-09-12");
  assert.equal(isMiamiPublishingTime(new Date("2026-07-01T12:30:00.000Z")), true);
  assert.equal(isMiamiPublishingTime(new Date("2026-01-01T13:30:00.000Z")), true);
  assert.equal(isMiamiPublishingTime(new Date("2026-07-01T13:30:00.000Z")), false);
});

test("rotates away from recent tour codes while retaining only viable live products", () => {
  const selected = selectDailyTour(tours, { recentCodes: ["B2", "C3"], now: NOW });
  assert.equal(selected.code, "A1");
  assert.equal(selectDailyTour([{ ...tours[0], price: null }], { now: NOW }), null);
  assert.deepEqual(cleanHistory({ days: null, tourCodes: ["A1", 3, ""] }), { days: {}, tourCodes: ["A1"] });
});

test("builds a first-party tracked landing URL and truthful booking copy", () => {
  const tour = tours[1];
  const landing = new URL(dailyPickLandingUrl(tour, "https://miamibesttours.tours"));
  const message = liveTourMessage(tour);
  assert.equal(landing.pathname, "/daily-pick/");
  assert.equal(landing.searchParams.get("tour"), "B2");
  assert.equal(landing.searchParams.get("utm_campaign"), "daily_miami_pick");
  assert.match(message, /Listed from \$70/);
  assert.match(message, /Affiliate disclosure/);
  assert.doesNotMatch(message, /discount|sale/i);
  assert.match(browseMessage(NOW), /Affiliate disclosure/);
});

test("returns the requested social tour first without exposing the API key", async () => {
  const socialCodes = ["28744P2", "5304HAVANA", "5096P35", "18774P7", "35834P1", "5493174P5"];
  const fetchImpl = async () => new Response(JSON.stringify({
    products: socialCodes.map((code) => product(code, `Tour ${code}`))
  }), { status: 200 });
  const result = await fetchTourCollection("social", { apiKey: "server-only-key", fetchImpl, highlight: "5304HAVANA" });
  assert.equal(result.collection, "social");
  assert.equal(result.products.length, 6);
  assert.equal(result.products[0].code, "5304HAVANA");
  assert.equal(new URL(result.products[0].url).searchParams.get("campaign"), "dailyFacebookPick2026");
  assert.equal(JSON.stringify(result).includes("server-only-key"), false);
});
