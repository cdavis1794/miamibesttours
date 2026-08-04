const VIATOR_URL = "https://api.viator.com/partner/products/search?campaign-value=miami-live-api";

const json = (status, body, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": status === 200
      ? "public, max-age=300, s-maxage=21600, stale-while-revalidate=86400"
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

export default async () => {
  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey) return json(503, { error: "Tour availability is temporarily unavailable." });

  try {
    const response = await fetch(VIATOR_URL, {
      method: "POST",
      headers: {
        "exp-api-key": apiKey,
        "Accept-Language": "en-US",
        Accept: "application/json;version=2.0",
        "Content-Type": "application/json;version=2.0",
      },
      body: JSON.stringify({
        filtering: { destination: "662" },
        sorting: { sort: "TRAVELER_RATING", order: "DESCENDING" },
        pagination: { start: 1, count: 8 },
        currency: "USD",
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Viator API request failed", response.status, data?.code || data?.message || "unknown");
      return json(502, { error: "Live tour results are temporarily unavailable.", upstreamStatus: response.status, upstreamCode: data?.code || null, upstreamMessage: data?.message || null });
    }

    const products = (data.products || [])
      .filter((product) => product?.productCode && product?.title && product?.productUrl)
      .slice(0, 6)
      .map((product) => ({
        code: product.productCode,
        title: product.title,
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
