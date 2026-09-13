import { getStore } from "@netlify/blobs";
import { fetchTourCollection } from "./viator-tours.mjs";
import { cleanHistory, isMiamiPublishingTime, miamiDateKey, selectDailyTour, trimHistory } from "./_lib/miami-picks.mjs";
import { browseLandingUrl, browseMessage, dailyPickLandingUrl, facebookConfiguration, liveTourMessage, publishFacebookLink } from "./_lib/facebook.mjs";

export const config = { schedule: "30 12,13 * * *" };

const HISTORY_KEY = "daily-facebook-post-history";
const asJson = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});

export default async function handler() {
  const now = new Date();
  if (!isMiamiPublishingTime(now)) {
    return asJson({ skipped: "Outside the 8:30 AM America/New_York posting window." });
  }

  if (process.env.FACEBOOK_AUTOPUBLISH_ENABLED !== "true") {
    console.info("Daily Facebook publisher is disabled. Set FACEBOOK_AUTOPUBLISH_ENABLED=true only after a live test.");
    return asJson({ skipped: "Autopublish is disabled." });
  }

  const configuration = facebookConfiguration();
  const store = getStore("miamibesttours-facebook-publishing");
  const day = miamiDateKey(now);
  const history = cleanHistory(await store.get(HISTORY_KEY, { type: "json", consistency: "strong" }));
  if (history.days[day]) {
    console.info(`Daily Facebook post already reserved for ${day}.`);
    return asJson({ skipped: "A post was already attempted today.", day });
  }

  let tours;
  try {
    ({ products: tours } = await fetchTourCollection("social"));
  } catch (error) {
    console.error("Could not load a current Viator tour for daily Facebook publishing", error?.message || error);
    return asJson({ day, published: false, error: "A current tour could not be loaded; no Facebook post was created." }, 502);
  }

  const tour = selectDailyTour(tours, { recentCodes: history.tourCodes, now });
  const post = tour
    ? { type: "tour_pick", tourCode: tour.code, message: liveTourMessage(tour), link: dailyPickLandingUrl(tour) }
    : { type: "browse", tourCode: null, message: browseMessage(now), link: browseLandingUrl(undefined, now) };

  // Reserve before the network call. An ambiguous response is never retried automatically, preventing duplicate public posts.
  const reservedHistory = trimHistory({
    ...history,
    days: {
      ...history.days,
      [day]: {
        attemptedAt: now.toISOString(),
        tourCode: post.tourCode,
        link: post.link,
        status: "attempting",
        type: post.type
      }
    },
    tourCodes: tour ? [tour.code, ...history.tourCodes.filter((code) => code !== tour.code)] : history.tourCodes
  });
  await store.set(HISTORY_KEY, JSON.stringify(reservedHistory));

  try {
    const facebookPostId = await publishFacebookLink({
      configuration,
      message: post.message,
      link: post.link
    });
    reservedHistory.days[day] = { ...reservedHistory.days[day], facebookPostId, postedAt: new Date().toISOString(), status: "posted" };
    await store.set(HISTORY_KEY, JSON.stringify(reservedHistory));
    console.info(`Published ${post.type} to Facebook for ${day}: ${facebookPostId}`);
    return asJson({ day, facebookPostId, published: true, type: post.type });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown publishing error";
    reservedHistory.days[day] = { ...reservedHistory.days[day], failedAt: new Date().toISOString(), status: "unknown", error: message };
    await store.set(HISTORY_KEY, JSON.stringify(reservedHistory));
    console.error(`Facebook publishing result is unknown for ${day}: ${message}`);
    return asJson({ day, published: false, error: "Facebook publishing could not be confirmed; no automatic retry will run." }, 502);
  }
}
