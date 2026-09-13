import { miamiDateKey } from "./miami-picks.mjs";

function siteUrl(value = process.env.PUBLIC_SITE_URL || "https://miamibesttours.tours") {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("PUBLIC_SITE_URL must be an HTTPS URL.");
  return url;
}

function graphVersion(value = process.env.FACEBOOK_GRAPH_VERSION) {
  if (!/^v\d+\.\d+$/.test(value || "")) {
    throw new Error("FACEBOOK_GRAPH_VERSION must be set to a current Graph API version, such as v25.0.");
  }
  return value;
}

export function facebookConfiguration(environment = process.env) {
  const pageId = String(environment.FACEBOOK_PAGE_ID || "").trim();
  const accessToken = String(environment.FACEBOOK_PAGE_ACCESS_TOKEN || "").trim();
  if (!/^\d+$/.test(pageId)) throw new Error("FACEBOOK_PAGE_ID is missing or invalid.");
  if (!accessToken) throw new Error("FACEBOOK_PAGE_ACCESS_TOKEN is missing.");
  return { pageId, accessToken, version: graphVersion(environment.FACEBOOK_GRAPH_VERSION) };
}

export function dailyPickLandingUrl(tour, baseUrl = process.env.PUBLIC_SITE_URL) {
  const url = new URL("/daily-pick/", siteUrl(baseUrl));
  url.searchParams.set("tour", tour.code);
  url.searchParams.set("utm_source", "facebook");
  url.searchParams.set("utm_medium", "organic");
  url.searchParams.set("utm_campaign", "daily_miami_pick");
  url.searchParams.set("utm_content", tour.code);
  return url.toString();
}

export function browseLandingUrl(baseUrl = process.env.PUBLIC_SITE_URL, now = new Date()) {
  const url = new URL("/daily-pick/", siteUrl(baseUrl));
  url.searchParams.set("utm_source", "facebook");
  url.searchParams.set("utm_medium", "organic");
  url.searchParams.set("utm_campaign", "daily_miami_browse");
  url.searchParams.set("utm_content", miamiDateKey(now));
  return url.toString();
}

function money(amount, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(Number(amount));
  } catch {
    return `$${Math.round(Number(amount))}`;
  }
}

export function liveTourMessage(tour) {
  const facts = [
    `Today’s Miami booking pick: ${tour.title}`,
    [tour.category, tour.duration].filter(Boolean).join(" · "),
    `Listed from ${money(tour.price, tour.currency)}${tour.rating ? ` · ${Number(tour.rating).toFixed(1)} rating${tour.reviews ? ` from ${Number(tour.reviews).toLocaleString()} reviews` : ""}` : ""}.`,
    "Availability, dates, price, meeting point, and cancellation terms can change. Check Viator for the current product details.",
    "Affiliate disclosure: Miami’s Best Tours may earn a commission if you book through this link, at no extra cost to you.",
    "Compare current details:"
  ].filter(Boolean);
  return facts.join("\n\n");
}

export function browseMessage(now = new Date()) {
  const options = [
    "Planning Miami? Start with one experience that matches your timing, then verify the live schedule and booking terms before you commit.",
    "Miami plans work better when the boat, food, culture, city, or Everglades experience fits the rest of your day. Compare current options before booking.",
    "A useful Miami itinerary starts with the real timing: meeting point, duration, transfer, and current availability. Browse the live options before you book."
  ];
  const index = Number(miamiDateKey(now).replaceAll("-", "")) % options.length;
  return [
    options[index],
    "Affiliate disclosure: Miami’s Best Tours may earn a commission if you book through this link, at no extra cost to you.",
    "Browse current Miami options:"
  ].join("\n\n");
}

function safeError(responseText) {
  try {
    const body = JSON.parse(responseText);
    return String(body?.error?.message || body?.error?.error_user_msg || body?.error || "Unknown Facebook error").slice(0, 300);
  } catch {
    return String(responseText || "Unknown Facebook error").replace(/access_token=[^&\s]+/gi, "access_token=[redacted]").slice(0, 300);
  }
}

export async function publishFacebookLink({ fetchImpl = globalThis.fetch, configuration, message, link }) {
  const endpoint = `https://graph.facebook.com/${configuration.version}/${configuration.pageId}/feed`;
  const body = new URLSearchParams({
    access_token: configuration.accessToken,
    message,
    link
  });
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error(`Facebook publish failed (${response.status}): ${safeError(responseText)}`);
  try {
    const payload = JSON.parse(responseText);
    if (!payload?.id) throw new Error("Facebook publish response did not include a post ID.");
    return payload.id;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Facebook publish returned an unexpected response.");
    throw error;
  }
}
