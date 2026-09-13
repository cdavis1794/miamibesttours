# Daily Miami Facebook booking picks

The site has two separate pieces:

- `/daily-pick/` reads current, curated Miami product data from Viator and places a Facebook-selected product first when it remains available.
- `publish-daily-tour` is a Netlify Scheduled Function. It checks at 8:30 AM America/New_York across daylight-saving changes, selects one viable live product, and makes a Facebook Page link post. It never labels an ordinary product as a sale or discount.

## Netlify production variables

Set these as **Production** variables only. Never add any credential to a repository, browser script, or public page.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VIATOR_API_KEY` | Already required for live cards | Server-side Viator partner API key. |
| `FACEBOOK_PAGE_ID` | Yes for publishing | The Miami Best Tours Facebook Page ID. |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Yes for publishing | A secret Page token with current `pages_manage_posts` permission. |
| `FACEBOOK_GRAPH_VERSION` | Yes for publishing | A current Graph API version approved for the Meta app, such as `v25.0`. |
| `FACEBOOK_AUTOPUBLISH_ENABLED` | Yes for publishing | Set exactly to `true` only after the first approved live post. Any other value keeps the publisher off. |
| `PUBLIC_SITE_URL` | Recommended | `https://miamibesttours.tours`; used for the Facebook landing link. |

## Publishing safeguards

- The code defaults to disabled. A scheduled invocation does not post until `FACEBOOK_AUTOPUBLISH_ENABLED=true` and a valid Page token are present.
- The schedule runs twice in UTC but only proceeds at 8:30 AM local Eastern time, so it stays at the intended time through daylight-saving changes.
- A durable Netlify Blob history reserves a day before contacting Meta. An uncertain Meta response is not retried automatically, avoiding duplicate public posts.
- The publisher uses first-party, UTM-tagged `/daily-pick/` URLs. The landing page retains the sponsored/nofollow Viator handoff and affiliate disclosure.
- A product must have a title, affiliate URL, and listed price. Copy says `Listed from` and tells visitors to confirm availability, terms, and price with Viator.
- The last six tour codes are avoided when alternatives exist. If every current product was recently used, the immediately previous tour is still avoided where possible.

## Before enabling the publisher

1. Verify `/daily-pick/` on the production site and open every outbound handoff as a normal visitor would.
2. Confirm the Page token belongs to the Miami Best Tours Page and has current content-publishing access.
3. Approve a specific first live post or use a known test Page. Do not turn on the scheduler merely to see whether it works.
4. Set `FACEBOOK_AUTOPUBLISH_ENABLED=true` only once destination, copy, Page identity, token, and audience are verified.

If the Viator service is unavailable, the publisher skips the post rather than making up a product or price. Review Netlify Function logs for errors or `unknown` status before doing any manual follow-up.
