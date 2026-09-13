const VIATOR_URL = "https://api.viator.com/partner/products/search";

const PRODUCT_AFFILIATE_URLS = new Map([
  ["5096P35", "https://www.viator.com/tours/Miami/BIG-Everglades-Experience-with-Transportation/d662-5096P35?pid=P00161591&mcid=42383&medium=link&medium_version=selector"],
  ["28744P2", "https://www.viator.com/tours/Miami/Miami-Sightseeing-Cruise-to-Millionaires-Homes/d662-28744P2?pid=P00161591&mcid=42383&medium=link&medium_version=selector"],
  ["5304HAVANA", "https://www.viator.com/tours/Miami/Little-Havana-Food-and-Walking-Tour-in-Miami/d662-5304HAVANA?pid=P00161591&mcid=42383&medium=link&medium_version=selector"],
  ["18774P7", "https://www.viator.com/tours/Miami/Wynwood-Graffiti-Golf-Cart-Tour/d662-18774P7?pid=P00161591&mcid=42383&medium=link&medium_version=selector"],
  ["5493174P5", "https://www.viator.com/tours/Miami/Miami-City-Tour/d662-5493174P5?pid=P00161591&mcid=42383&medium=link&medium_version=selector"],
  ["35834P1", "https://www.viator.com/tours/Miami/Speedboat-Sightseeing-Tour-in-Miami/d662-35834P1?pid=P00161591&mcid=42383&medium=link&medium_version=selector"],
  ["21428P2", "https://www.viator.com/tours/Miami/Everglades-Tour-from-Miami-with-Transportation/d662-21428P2?pid=P00161591&mcid=42383&medium=link&medium_version=selector"],
  ["38439P1", "https://www.viator.com/tours/Miami/Day-Trip-to-Key-West-from-Miami/d662-38439P1?pid=P00161591&mcid=42383&medium=link&medium_version=selector"],
  ["8836P7", "https://www.viator.com/tours/Miami/Party-Boat-Cruise-in-Miami/d662-8836P7?pid=P00161591&mcid=42383&medium=link&medium_version=selector"],
  ["8836P2", "https://www.viator.com/tours/Miami/Pirates-Adventures-Sightseeing-Tour-from-Miami/d662-8836P2?pid=P00161591&mcid=42383&medium=link&medium_version=selector"],
]);

const CRUISE_PRODUCTS = [
  { code: "28744P2", category: "Short waterfront option", fit: "Compare its Bayside meeting point with your luggage and airport-transfer plan." },
  { code: "35834P1", category: "Quick waterfront option", fit: "A compact experience when the departure point fits your route." },
  { code: "18774P7", category: "Compact neighborhood option", fit: "Useful for a shorter window when Wynwood works with your transfer plan." },
  { code: "5304HAVANA", category: "Half-day culture option", fit: "Best when the full walking-tour schedule leaves meaningful airport buffer." },
  { code: "5493174P5", category: "City overview option", fit: "Verify the complete route, pickup details and return point before booking." },
  { code: "5096P35", category: "Long layover only", fit: "Consider only after confirming transportation, luggage and the complete return schedule." },
];

const BOAT_PRODUCTS = [
  { code: "28744P2", category: "Narrated sightseeing", fit: "A lower-cost 90-minute format; verify the current route, vessel, departure point, and narration before booking." },
  { code: "35834P1", category: "Fast sightseeing", fit: "A compact 45-minute option for motion and skyline views, not a calm narrated cruise." },
  { code: "8836P7", category: "Skyline and city lights", fit: "Compare the departure time, music, seating, and included drinks with the atmosphere your group wants." },
  { code: "8836P2", category: "Family-friendly sightseeing", fit: "A themed sightseeing format with strong review context; confirm accessibility, shade, and the exact route." },
];

const EVERGLADES_PRODUCTS = [
  { code: "21428P2", category: "Small-group transfer", fit: "Prioritize this format when pickup convenience, a smaller vehicle, and more guide interaction justify the higher price." },
  { code: "5096P35", category: "Value roundtrip transfer", fit: "A high-volume option with roundtrip bus transportation; compare total pickup time and the wildlife-exhibit format." },
];

const KEY_WEST_PRODUCTS = [
  { code: "38439P1", category: "Day trip with activity options", fit: "Compare the complete 15-hour schedule, pickup point, usable island time, and optional-activity check-in details." },
];

const LITTLE_HAVANA_PRODUCTS = [
  { code: "5304HAVANA", category: "Food and walking tour", fit: "A review-rich 2.5-hour format; confirm dietary accommodations, tasting count, walking pace, and group size." },
];

const FAMILY_PRODUCTS = [
  { code: "28744P2", category: "Lower-demand family option", fit: "Useful when a shorter duration and low physical demand matter; verify shade, restrooms, and child policies." },
  { code: "5493174P5", category: "City overview", fit: "A multi-stop overview for groups that value breadth; verify the vehicle, boarding, and exact return point." },
  { code: "5304HAVANA", category: "Food and culture", fit: "Best for groups comfortable with walking and shared tastings; confirm dietary and age fit first." },
];

const COLLECTIONS = {
  home: {
    campaign: "homeLiveGrid2026",
    limit: 6,
    products: [
      { code: "5096P35", category: "Everglades" },
      { code: "28744P2", category: "Biscayne Bay" },
      { code: "5304HAVANA", category: "Little Havana" },
      { code: "18774P7", category: "Wynwood" },
      { code: "5493174P5", category: "City Highlights" },
      { code: "35834P1", category: "Biscayne Bay" },
    ],
  },
  social: {
    campaign: "dailyFacebookPick2026",
    limit: 6,
    strict: true,
    products: [
      { code: "28744P2", category: "Biscayne Bay", fit: "A compact waterfront choice; confirm the departure point, route, and current schedule before booking." },
      { code: "5304HAVANA", category: "Little Havana", fit: "A food-and-culture walk; confirm dietary accommodations, tasting details, walking pace, and group size." },
      { code: "5096P35", category: "Everglades", fit: "A transfer-included option; compare the full pickup window, total clock, and included experience." },
      { code: "18774P7", category: "Wynwood", fit: "A shorter neighborhood option when the meeting point and route fit your Miami day." },
      { code: "35834P1", category: "Biscayne Bay", fit: "A fast sightseeing format rather than a calm narrated cruise; confirm conditions and departure details." },
      { code: "5493174P5", category: "City Highlights", fit: "A broader city overview; verify the current route, vehicle, boarding point, and return timing." },
    ],
  },
  cruise: {
    campaign: "cruiseLayover2026",
    limit: 6,
    products: CRUISE_PRODUCTS,
  },
  "cruise-youtube": {
    campaign: "youtubeCruise2026",
    limit: 6,
    products: CRUISE_PRODUCTS,
  },
  boat: {
    campaign: "boatGuideLive2026",
    limit: 4,
    strict: true,
    products: BOAT_PRODUCTS,
  },
  everglades: {
    campaign: "evergladesGuideLive2026",
    limit: 2,
    strict: true,
    products: EVERGLADES_PRODUCTS,
  },
  "key-west": {
    campaign: "keyWestGuideLive2026",
    limit: 1,
    strict: true,
    products: KEY_WEST_PRODUCTS,
  },
  "little-havana": {
    campaign: "littleHavanaGuideLive2026",
    limit: 1,
    strict: true,
    products: LITTLE_HAVANA_PRODUCTS,
  },
  family: {
    campaign: "familyGuideLive2026",
    limit: 3,
    strict: true,
    products: FAMILY_PRODUCTS,
  },
};

const affiliateUrlFor = (product, campaign) => {
  const productCode = String(product?.productCode || "").toUpperCase();
  const directUrl = PRODUCT_AFFILIATE_URLS.get(productCode);
  const productUrl = directUrl || product?.productUrl;
  if (!productUrl) return "";

  const url = new URL(productUrl);
  url.searchParams.set("campaign", campaign);
  url.searchParams.set("target_lander", "NONE");
  return url.toString();
};

const apiHeaders = (apiKey) => ({
  "exp-api-key": apiKey,
  "Accept-Language": "en-US",
  Accept: "application/json;version=2.0",
});

const json = (status, body, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": status === 200
      ? "public, max-age=300, s-maxage=3600"
      : "no-store",
    ...extra,
  },
});

const imageFor = (images = []) => {
  const candidates = images.flatMap((image) => image.variants || []);
  return candidates
    .filter((item) => item?.url)
    .sort((a, b) => Math.abs((a.width || 0) - 720) - Math.abs((b.width || 0) - 720))[0]?.url || "";
};

const durationFor = (duration = {}) => {
  const min = duration.fixedDurationInMinutes || duration.variableDurationFromMinutes;
  const max = duration.variableDurationToMinutes;
  if (!min) return "";
  if (max && max !== min) return `${Math.round(min / 60 * 10) / 10}–${Math.round(max / 60 * 10) / 10} hr`;
  return min >= 60 ? `${Math.round(min / 60 * 10) / 10} hr` : `${min} min`;
};

const categoryFor = (product = {}, preferredByCode = new Map()) => {
  const preferred = preferredByCode.get(String(product.productCode || "").toUpperCase());
  if (preferred) return preferred.category;
  const title = String(product.title || "").toLowerCase();
  if (/everglades|airboat/.test(title)) return "Everglades";
  if (/little havana|food|culinary|cuban/.test(title)) return "Little Havana";
  if (/wynwood|graffiti|street art/.test(title)) return "Wynwood";
  if (/boat|cruise|speedboat|yacht|sail|bay/.test(title)) return "Biscayne Bay";
  if (/city|hop-on|sightseeing|south beach|art deco/.test(title)) return "City Highlights";
  if (/helicopter|private|luxury/.test(title)) return "Luxury";
  return "Miami Favorite";
};

const productScore = (product = {}) => {
  const reviews = Number(product.reviews?.totalReviews || 0);
  const rating = Number(product.reviews?.combinedAverageRating || 0);
  const title = String(product.title || "").toLowerCase();
  const intentBoost = /everglades|airboat|little havana|food|wynwood|boat|cruise|speedboat|city tour|south beach/.test(title) ? 1500 : 0;
  return reviews * Math.max(rating - 3, 0) + intentBoost;
};

const addMissingPreferredProducts = async (products, apiKey, preferredProducts, campaign, fetchImpl = globalThis.fetch) => {
  const productList = Array.isArray(products) ? products : [];
  const presentCodes = new Set(productList.map((product) => String(product?.productCode || "").toUpperCase()));
  const missing = preferredProducts.filter((item) => !presentCodes.has(item.code));
  if (!missing.length) return productList;

  const detailProducts = await Promise.all(missing.map(async ({ code }) => {
    try {
      const response = await fetchImpl(
        `https://api.viator.com/partner/products/${encodeURIComponent(code)}?campaign-value=${encodeURIComponent(campaign)}`,
        { headers: apiHeaders(apiKey) },
      );
      if (!response.ok) {
        console.warn("Viator product detail request failed", code, response.status);
        return null;
      }
      return await response.json().catch(() => null);
    } catch (error) {
      console.warn("Viator product detail request failed", code, error?.message || error);
      return null;
    }
  }));

  return [...productList, ...detailProducts.filter(Boolean)];
};

const selectProducts = (products = [], preferredProducts = [], limit = 6, strict = false) => {
  const preferredByCode = new Map(preferredProducts.map((item) => [item.code, item]));
  const eligible = products.filter((product) =>
    product?.productCode &&
    product?.title &&
    product?.productUrl &&
    !/\b(french|german|portuguese)\b/i.test(product.title),
  );
  const byCode = new Map(eligible.map((product) => [String(product.productCode).toUpperCase(), product]));
  const selected = preferredProducts.map((item) => byCode.get(item.code)).filter(Boolean);
  if (strict) return selected.slice(0, limit);
  const selectedCodes = new Set(selected.map((product) => String(product.productCode).toUpperCase()));
  const categoryCounts = selected.reduce((counts, product) => {
    const category = categoryFor(product, preferredByCode);
    counts.set(category, (counts.get(category) || 0) + 1);
    return counts;
  }, new Map());

  const ranked = eligible
    .filter((product) => !selectedCodes.has(String(product.productCode).toUpperCase()))
    .sort((a, b) => productScore(b) - productScore(a));

  for (const product of ranked) {
    if (selected.length >= limit) break;
    const reviews = Number(product.reviews?.totalReviews || 0);
    const rating = Number(product.reviews?.combinedAverageRating || 0);
    const category = categoryFor(product, preferredByCode);
    if (reviews < 100 || rating < 4.2 || (categoryCounts.get(category) || 0) >= 2) continue;
    selected.push(product);
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  }

  for (const product of ranked) {
    if (selected.length >= limit) break;
    if (selected.includes(product)) continue;
    selected.push(product);
  }

  return selected.slice(0, limit);
};

const cleanApiKey = (value) => String(value || "").trim().replace(/^['"]|['"]$/g, "");

const safeTourCode = (value) => String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 32);

export async function fetchTourCollection(collectionKey = "home", { apiKey = cleanApiKey(process.env.VIATOR_API_KEY), fetchImpl = globalThis.fetch, highlight = "" } = {}) {
  if (!apiKey) throw new Error("Missing VIATOR_API_KEY.");

  const resolvedCollectionKey = COLLECTIONS[collectionKey] ? collectionKey : "home";
  const collection = COLLECTIONS[resolvedCollectionKey];
  const preferredByCode = new Map(collection.products.map((item) => [item.code, item]));

  const response = await fetchImpl(`${VIATOR_URL}?campaign-value=${encodeURIComponent(collection.campaign)}`, {
      method: "POST",
      headers: {
        ...apiHeaders(apiKey),
        "Content-Type": "application/json;version=2.0",
      },
      body: JSON.stringify({
        filtering: { destination: "662" },
        pagination: { start: 1, count: 50 },
        currency: "USD",
      }),
    });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Viator API request failed", response.status, data?.code || data?.message || "unknown");
    throw new Error(`Viator API request failed (${response.status}).`);
  }

  const candidateProducts = await addMissingPreferredProducts(data.products || [], apiKey, collection.products, collection.campaign, fetchImpl);
  const products = selectProducts(candidateProducts, collection.products, collection.limit || 6, collection.strict === true)
      .map((product) => ({
        code: product.productCode,
        title: product.title,
        category: categoryFor(product, preferredByCode),
        fit: preferredByCode.get(String(product.productCode || "").toUpperCase())?.fit || "",
        placement: `${collectionKey}-live-${String(product.productCode).toLowerCase()}`,
        image: imageFor(product.images),
        rating: product.reviews?.combinedAverageRating || null,
        reviews: product.reviews?.totalReviews || 0,
        price: product.pricing?.summary?.fromPrice || null,
        currency: product.pricing?.currency || "USD",
        duration: durationFor(product.duration),
        url: affiliateUrlFor(product, collection.campaign),
      }));

  const highlightedCode = safeTourCode(highlight);
  if (highlightedCode) {
    products.sort((left, right) => Number(safeTourCode(right.code) === highlightedCode) - Number(safeTourCode(left.code) === highlightedCode));
  }

  return { collection: resolvedCollectionKey, products, updatedAt: new Date().toISOString() };
}

export default async (request) => {
  const apiKey = cleanApiKey(process.env.VIATOR_API_KEY);
  if (!apiKey) return json(503, { error: "Tour availability is temporarily unavailable." });

  const requestUrl = new URL(request.url);
  const collectionKey = requestUrl.searchParams.get("collection") || "home";
  const highlight = requestUrl.searchParams.get("highlight") || requestUrl.searchParams.get("tour") || "";

  try {
    const result = await fetchTourCollection(collectionKey, { apiKey, highlight });
    return json(200, result);
  } catch (error) {
    console.error("Viator API connection failed", error?.message || error);
    return json(502, { error: "Live tour results are temporarily unavailable." });
  }
};

