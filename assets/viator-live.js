(() => {
  const money = (amount, currency) => {
    if (typeof amount !== "number") return "Check price";
    try { return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(amount); }
    catch { return "$" + Math.round(amount); }
  };

  const card = (tour) => {
    const article = document.createElement("article");
    article.className = "viator-live-card";
    const optimizedImage = (width) => `/.netlify/images?url=${encodeURIComponent(tour.image)}&w=${width}&h=${Math.round(width * 2 / 3)}&fit=cover&q=65`;
    const image = tour.image
      ? `<img src="${optimizedImage(420)}" srcset="${optimizedImage(360)} 360w, ${optimizedImage(420)} 420w, ${optimizedImage(720)} 720w" sizes="(min-width: 900px) 410px, calc(100vw - 36px)" alt="" width="420" height="280" loading="lazy" decoding="async">`
      : '<div class="viator-live-placeholder" aria-hidden="true">Miami</div>';
    const rating = tour.rating
      ? `<span class="viator-live-rating">★ ${Number(tour.rating).toFixed(1)}${tour.reviews ? ` · ${Number(tour.reviews).toLocaleString()} reviews` : ""}</span>`
      : "";
    article.innerHTML = `${image}<div class="viator-live-body">${rating}<h3>${tour.title}</h3><div class="viator-live-meta">${tour.duration ? `<span>⏱ ${tour.duration}</span>` : ""}<span>From <strong>${money(tour.price, tour.currency)}</strong></span></div><a href="${tour.url}" target="_blank" rel="sponsored nofollow noopener">Check live availability</a></div>`;
    return article;
  };

  const mount = async () => {
    if (document.getElementById("live-viator-tours")) return;
    const target = document.querySelector("#root #tours");
    if (!target) return setTimeout(mount, 250);

    const section = document.createElement("section");
    section.id = "live-viator-tours";
    section.className = "viator-live";
    section.innerHTML = '<div class="viator-live-inner"><div class="viator-live-kicker">Updated from Viator</div><h2>Miami tours with live pricing</h2><p class="viator-live-intro">A focused selection from Viator’s current Miami inventory. Prices and availability can change; open a tour to confirm the final details.</p><div class="viator-live-status" role="status">Loading current tour options…</div><div class="viator-live-grid"></div><p class="viator-live-disclosure">Affiliate disclosure: Miami’s Best Tours may earn a commission when you book through these links, at no extra cost to you. Viator completes the transaction and provides booking support.</p></div>';
    target.before(section);

    try {
      const response = await fetch("/.netlify/functions/viator-tours", { headers: { Accept: "application/json" } });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.products) || !data.products.length) throw new Error("No products");
      const grid = section.querySelector(".viator-live-grid");
      data.products.forEach((tour) => grid.appendChild(card(tour)));
      section.querySelector(".viator-live-status").remove();
    } catch {
      section.remove();
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
