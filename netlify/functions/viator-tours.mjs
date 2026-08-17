const VIATOR_URL = "https://api.viator.com/partner/products/search?campaign-value=homeLiveGrid2026";

const PREFERRED_PRODUCTS = [
  { code: "5096P35", category: "Everglades" },
  { code: "28744P2", category: "Biscayne Bay" },
  { code: "5304HAVANA", category: "Little Havana" },
  { code: "18774P7", category: "Wynwood" },
  { code: "5493174P5", category: "City Highlights" },
  { code: "35834P1", category: "Biscayne Bay" },
];

const preferredByCode = new Map(PREFERRED_PRODUCTS.map((item) => [item.code, item]));

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

const categoryFor = (product = {}) => {
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

const addMissingPreferredProducts = async (products, apiKey) => {
  const productList = Array.isArray(products) ? products : [];
  const presentCodes = new Set(productList.map((product) => String(product?.productCode || "").toUpperCase()));
  const missing = PREFERRED_PRODUCTS.filter((item) => !presentCodes.has(item.code));
  if (!missing.length) return productList;

  const detailProducts = await Promise.all(missing.map(async ({ code }) => {
    try {
      const response = await fetch(
        `https://api.viator.com/partner/products/${encodeURIComponent(code)}?campaign-value=homeLiveGrid2026`,
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

const selectProducts = (products = []) => {
  const eligible = products.filter((product) =>
    product?.productCode &&
    product?.title &&
    product?.productUrl &&
    !/\b(french|german|portuguese)\b/i.test(product.title),
  );
  const byCode = new Map(eligible.map((product) => [String(product.productCode).toUpperCase(), product]));
  const selected = PREFERRED_PRODUCTS.map((item) => byCode.get(item.code)).filter(Boolean);
  const selectedCodes = new Set(selected.map((product) => String(product.productCode).toUpperCase()));
  const categoryCounts = selected.reduce((counts, product) => {
    const category = categoryFor(product);
    counts.set(category, (counts.get(category) || 0) + 1);
    return counts;
  }, new Map());

  const ranked = eligible
    .filter((product) => !selectedCodes.has(String(product.productCode).toUpperCase()))
    .sort((a, b) => productScore(b) - productScore(a));

  for (const product of ranked) {
    if (selected.length >= 6) break;
    const reviews = Number(product.reviews?.totalReviews || 0);
    const rating = Number(product.reviews?.combinedAverageRating || 0);
    const category = categoryFor(product);
    if (reviews < 100 || rating < 4.2 || (categoryCounts.get(category) || 0) >= 2) continue;
    selected.push(product);
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  }

  for (const product of ranked) {
    if (selected.length >= 6) break;
    if (selected.includes(product)) continue;
    selected.push(product);
  }

  return selected.slice(0, 6);
};

export default async () => {
  const apiKey = process.env.VIATOR_API_KEY?.trim().replace(/^['"]|['"]$/g, "");
  if (!apiKey) return json(503, { error: "Tour availability is temporarily unavailable." });

  try {
    const response = await fetch(VIATOR_URL, {
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
      return json(502, { error: "Live tour results are temporarily unavailable." });
    }

    const candidateProducts = await addMissingPreferredProducts(data.products || [], apiKey);
    const products = selectProducts(candidateProducts)
      .map((product) => ({
        code: product.productCode,
        title: product.title,
        category: categoryFor(product),
        placement: `home-live-${String(product.productCode).toLowerCase()}`,
        image: imageFor(product.images),
        rating: product.reviews?.combinedAverageRating || null,
        reviews: product.reviews?.totalReviews || 0,
        price: product.pricing?.summary?.fromPrice || null,
        currency: product.pricing?.currency || "USD",
        duration: durationFor(product.duration),
        url: product.productUrl,
      }));

    return json(200, { products, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Viator API connection failed", error?.message || error);
    return json(502, { error: "Live tour results are temporarily unavailable." });
  }
};

