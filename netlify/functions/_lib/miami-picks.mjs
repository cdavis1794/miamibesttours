export const MIAMI_TIME_ZONE = "America/New_York";

const MAX_HISTORY_DAYS = 60;

function easternParts(now) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MIAMI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  return Object.fromEntries(formatter.formatToParts(now)
    .filter(({ type }) => type !== "literal")
    .map(({ type, value }) => [type, value]));
}

export function miamiDateKey(now = new Date()) {
  const parts = easternParts(now);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isMiamiPublishingTime(now = new Date()) {
  const parts = easternParts(now);
  return parts.hour === "08" && parts.minute === "30";
}

export function cleanHistory(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { days: {}, tourCodes: [] };
  return {
    days: value.days && typeof value.days === "object" && !Array.isArray(value.days) ? value.days : {},
    tourCodes: Array.isArray(value.tourCodes)
      ? value.tourCodes.filter((code) => typeof code === "string" && code.trim()).slice(0, MAX_HISTORY_DAYS)
      : []
  };
}

export function trimHistory(history) {
  const days = Object.entries(history.days)
    .sort(([left], [right]) => right.localeCompare(left))
    .slice(0, MAX_HISTORY_DAYS);
  return { ...history, days: Object.fromEntries(days), tourCodes: history.tourCodes.slice(0, MAX_HISTORY_DAYS) };
}

const codeOf = (tour) => String(tour?.code || "").trim().toUpperCase();

const scoreTour = (tour) => {
  const price = Number(tour?.price);
  const rating = Number(tour?.rating || 0);
  const reviews = Number(tour?.reviews || 0);
  const category = String(tour?.category || "").toLowerCase();
  const categoryBoost = /biscayne|little havana|everglades|wynwood|city/.test(category) ? 100 : 0;
  return categoryBoost + rating * 1_000 + Math.min(reviews, 20_000) / 20 + (price > 0 ? 50 : -10_000);
};

function dailySeed(now) {
  return Number(miamiDateKey(now).replaceAll("-", "")) || 0;
}

export function selectDailyTour(tours, { recentCodes = [], now = new Date() } = {}) {
  const candidates = (Array.isArray(tours) ? tours : [])
    .filter((tour) => codeOf(tour) && typeof tour?.title === "string" && tour.title.trim() && typeof tour?.url === "string" && tour.url.startsWith("https://"))
    .map((tour) => ({ ...tour, code: codeOf(tour), score: scoreTour(tour) }))
    .filter((tour) => Number(tour.price) > 0)
    .sort((left, right) => right.score - left.score || left.code.localeCompare(right.code));

  if (!candidates.length) return null;

  const recent = recentCodes.map((code) => String(code).trim().toUpperCase()).filter(Boolean).slice(0, 6);
  const recentSet = new Set(recent);
  let pool = candidates.filter((tour) => !recentSet.has(tour.code));
  if (!pool.length) pool = candidates.filter((tour) => tour.code !== recent[0]);
  if (!pool.length) pool = candidates;
  return pool[dailySeed(now) % pool.length];
}
