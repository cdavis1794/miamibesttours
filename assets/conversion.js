(() => {
  const allowed = new Set(["page_view","product_view","checkout_started","affiliate_click","access_page_view","feedback_submitted"]);
  const session = () => { const key = "miami_conversion_session"; let id = sessionStorage.getItem(key); if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id); } return id; };
  const track = (event, details = {}) => {
    if (!allowed.has(event)) return;
    const body = JSON.stringify({ event, path: location.pathname, session: session(), ...details });
    if (navigator.sendBeacon) navigator.sendBeacon("/.netlify/functions/conversion-event", new Blob([body], { type: "application/json" }));
    else fetch("/.netlify/functions/conversion-event", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
  };
  const affiliatePartner = hostname => {
    const host = hostname.replace(/^www\./, "").toLowerCase();
    if (host === "viator.com" || host.endsWith(".viator.com") || host === "vi.me") return "Viator";
    if (host.endsWith("tpo.lv")) return "Travelpayouts";
    return "";
  };
  const placement = link => link.dataset.placement || link.closest("[data-placement]")?.dataset.placement || link.closest("[data-affiliate-placement]")?.dataset.affiliatePlacement || link.closest("section,header,footer,aside,article")?.id || link.closest("section,header,footer,aside,article")?.className || "page";
  const place = () => {
    const footer = document.querySelector("#root footer");
    const packages = document.querySelector(".tcp-packages");
    if (footer && packages) {
      if (packages.nextElementSibling !== footer) footer.before(packages);
      packages.classList.remove("layout-pending");
    }
    const live = document.getElementById("live-viator-tours");
    const main = document.querySelector("#root #tours");
    const bridge = document.getElementById("miami-plan-bridge");
    if (live && bridge) {
      if (live.nextElementSibling !== bridge) live.after(bridge);
      bridge.classList.remove("layout-pending");
    } else if (main && bridge && !live) {
      if (main.previousElementSibling !== bridge) main.before(bridge);
      bridge.classList.remove("layout-pending");
    }
    if (main && !main.querySelector(".editorial-note")) {
      const heading = main.querySelector("h2");
      if (heading) { const note = document.createElement("p"); note.className = "editorial-note"; note.textContent = "Editorial shortlist. Ratings, prices, ticket formats, and cancellation terms can change; open Viator to confirm the current details."; heading.after(note); }
    }
  };
  const start = () => {
    track("page_view");
    if (document.body.dataset.productAccess) track("access_page_view", { product: document.body.dataset.productAccess });
    const seen = new WeakSet();
    const observed = new WeakSet();
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting && !seen.has(entry.target)) { seen.add(entry.target); track("product_view", { product: entry.target.dataset.product || "" }); } }), { threshold: .35 });
    const observeProducts = root => {
      const elements = [];
      if (root?.matches?.("[data-product-view]")) elements.push(root);
      root?.querySelectorAll?.("[data-product-view]").forEach(element => elements.push(element));
      elements.forEach(element => { if (!observed.has(element)) { observed.add(element); observer.observe(element); } });
    };
    observeProducts(document);
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(observeProducts))).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("click", event => {
      const link = event.target.closest && event.target.closest("a[href]"); if (!link) return;
      if (link.href.includes("buy.stripe.com")) track("checkout_started", { product: link.dataset.product || "" });
      else {
        try {
          const url = new URL(link.href, location.href);
          const partner = affiliatePartner(url.hostname);
          if (partner) track("affiliate_click", {
            product: link.dataset.product || link.closest("[data-product]")?.dataset.product || "",
            partner,
            destination: url.origin + url.pathname,
            placement: String(placement(link)).slice(0, 120),
            label: (link.textContent || "").trim().replace(/\s+/g," ").slice(0,140),
          });
        } catch {}
      }
    }, true);
    const form = document.querySelector('form[name="miami-product-feedback"]');
    if (form) form.addEventListener("submit", () => track("feedback_submitted", { product: form.querySelector('[name="product"]')?.value || "" }));
    if (new URLSearchParams(location.search).get("feedback") === "thanks") { const thanks = document.querySelector(".feedback-thanks"); if (thanks) thanks.hidden = false; }
    let attempts = 0;
    const settle = () => { place(); if (attempts++ < 20) setTimeout(settle, 250); };
    settle();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

