(() => {
  const allowed = new Set(["page_view","product_view","checkout_started","affiliate_click","access_page_view","feedback_submitted"]);
  const session = () => { const key = "miami_conversion_session"; let id = sessionStorage.getItem(key); if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id); } return id; };
  const track = (event, details = {}) => {
    if (!allowed.has(event)) return;
    const body = JSON.stringify({ event, path: location.pathname, session: session(), ...details });
    if (navigator.sendBeacon) navigator.sendBeacon("/.netlify/functions/conversion-event", new Blob([body], { type: "application/json" }));
    else fetch("/.netlify/functions/conversion-event", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
  };
  const place = () => {
    const footer = document.querySelector("#root footer");
    const packages = document.querySelector(".tcp-packages");
    if (footer && packages && packages.nextElementSibling !== footer) footer.before(packages);
    const live = document.getElementById("live-viator-tours");
    const main = document.querySelector("#root #tours");
    const bridge = document.getElementById("miami-plan-bridge");
    if (live && bridge && live.nextElementSibling !== bridge) live.after(bridge);
    else if (main && bridge && !live && main.previousElementSibling !== bridge) main.before(bridge);
    if (main && !main.querySelector(".editorial-note")) {
      const heading = main.querySelector("h2");
      if (heading) { const note = document.createElement("p"); note.className = "editorial-note"; note.textContent = "Editorial shortlist. Ratings, prices, ticket formats, and cancellation terms can change; open Viator to confirm the current details."; heading.after(note); }
    }
  };
  const start = () => {
    track("page_view");
    if (document.body.dataset.productAccess) track("access_page_view", { product: document.body.dataset.productAccess });
    const seen = new WeakSet();
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting && !seen.has(entry.target)) { seen.add(entry.target); track("product_view", { product: entry.target.dataset.product || "" }); } }), { threshold: .35 });
    document.querySelectorAll("[data-product-view]").forEach(element => observer.observe(element));
    document.addEventListener("click", event => {
      const link = event.target.closest && event.target.closest("a[href]"); if (!link) return;
      if (link.href.includes("buy.stripe.com")) track("checkout_started", { product: link.dataset.product || "" });
      else if (link.href.includes("viator.com")) track("affiliate_click", { label: (link.textContent || "").trim().replace(/\s+/g," ").slice(0,140) });
    }, true);
    const form = document.querySelector('form[name="miami-product-feedback"]');
    if (form) form.addEventListener("submit", () => track("feedback_submitted", { product: form.querySelector('[name="product"]')?.value || "" }));
    if (new URLSearchParams(location.search).get("feedback") === "thanks") { const thanks = document.querySelector(".feedback-thanks"); if (thanks) thanks.hidden = false; }
    place(); setTimeout(place, 400); setTimeout(place, 1400);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();