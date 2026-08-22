(() => {
  const ALL_TOURS_URL = "https://www.viator.com/Miami/d662-ttd?sortType=external&pid=P00161591&mcid=42383&medium=link&medium_version=selector";
  const GUIDE_LINKS = [
    { label: "Cruise & flight-day tours", description: "Time-safe ideas for port arrivals, layovers and late flights", href: "/guides/miami-tours-for-cruise-passengers/" },
    { label: "Everglades tours", description: "Airboats, wildlife and transportation options", href: "/guides/everglades-tours-from-miami/" },
    { label: "Boat tours", description: "Biscayne Bay, skyline and sunset cruises", href: "/guides/miami-boat-tours/" },
    { label: "Little Havana", description: "Food walks, Cuban culture and cafecito", href: "/guides/little-havana-food-tours/" },
    { label: "Choose your trip style", description: "Compare options for families and couples", href: "/guides/miami-tours-for-families-couples/" },
  ];

  const money = (amount, currency) => {
    if (typeof amount !== "number") return "Check price";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return "$" + Math.round(amount);
    }
  };

  const optimizedImage = (url, width) =>
    `/.netlify/images?url=${encodeURIComponent(url)}&w=${width}&h=${Math.round(width * 2 / 3)}&fit=cover&q=68`;

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const card = (tour, index) => {
    const placement = tour.placement || `home-live-${index + 1}`;
    const article = node("article", "viator-live-card");
    article.dataset.productView = "";
    article.dataset.product = tour.code || tour.title;
    article.dataset.placement = placement;

    if (tour.image) {
      const image = document.createElement("img");
      image.src = optimizedImage(tour.image, 420);
      image.srcset = `${optimizedImage(tour.image, 360)} 360w, ${optimizedImage(tour.image, 420)} 420w, ${optimizedImage(tour.image, 720)} 720w`;
      image.sizes = "(min-width: 900px) 410px, calc(100vw - 36px)";
      image.alt = `${tour.title} in Miami`;
      image.width = 420;
      image.height = 280;
      image.loading = "lazy";
      image.decoding = "async";
      article.appendChild(image);
    } else {
      article.appendChild(node("div", "viator-live-placeholder", "Miami"));
    }

    const body = node("div", "viator-live-body");
    body.appendChild(node("span", "viator-live-category", tour.category || "Miami Favorite"));
    if (tour.rating) {
      const reviewText = tour.reviews ? ` · ${Number(tour.reviews).toLocaleString()} reviews` : "";
      body.appendChild(node("span", "viator-live-rating", `★ ${Number(tour.rating).toFixed(1)}${reviewText}`));
    }
    body.appendChild(node("h3", "", tour.title));

    const meta = node("div", "viator-live-meta");
    if (tour.duration) meta.appendChild(node("span", "", `⏱ ${tour.duration}`));
    const price = node("span", "", "From ");
    price.appendChild(node("strong", "", money(tour.price, tour.currency)));
    meta.appendChild(price);
    body.appendChild(meta);

    const link = node("a", "", "Check live availability");
    link.href = tour.url;
    link.target = "_blank";
    link.rel = "sponsored nofollow noopener";
    link.dataset.product = tour.code || tour.title;
    link.dataset.placement = placement;
    link.setAttribute("aria-label", `Check live availability for ${tour.title} on Viator`);
    body.appendChild(link);
    article.appendChild(body);
    return article;
  };

  const buildGuides = () => {
    const section = node("section", "miami-category-guides");
    section.id = "miami-category-guides";
    section.setAttribute("aria-labelledby", "miami-category-guides-title");
    const inner = node("div", "miami-category-guides__inner");
    inner.appendChild(node("div", "viator-live-kicker", "Explore by interest"));
    const heading = node("h2", "", "Not sure which Miami experience fits?");
    heading.id = "miami-category-guides-title";
    inner.appendChild(heading);
    inner.appendChild(node("p", "miami-category-guides__intro", "Use a focused local guide, then return to the live products above to compare current prices and dates."));
    const grid = node("div", "miami-category-guides__grid");
    GUIDE_LINKS.forEach((guide, index) => {
      const link = node("a", "miami-category-guide");
      link.href = guide.href;
      link.dataset.placement = `home-guide-${index + 1}`;
      link.appendChild(node("strong", "", guide.label));
      link.appendChild(node("span", "", guide.description));
      link.appendChild(node("b", "", "Read guide →"));
      grid.appendChild(link);
    });
    inner.appendChild(grid);
    section.appendChild(inner);
    return section;
  };

  const setMeta = () => {
    const title = "Best Miami Tours for 2026 | Miami's Best Tours";
    const description = "Compare live Miami tour prices, ratings and durations for Everglades, Biscayne Bay, Little Havana, Wynwood and city experiences, then book securely on Viator.";
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      if (/\"@type\"\s*:\s*\"ItemList\"/.test(script.textContent || "")) script.remove();
    });
  };

  const wireFunnel = (hideEditorial = false) => {
    const live = document.getElementById("live-viator-tours");
    if (!live) return;

    document.querySelectorAll("a, button").forEach((control) => {
      const label = (control.textContent || "").trim().replace(/\s+/g, " ");
      if (label === "Search Tours" || label.startsWith("Check Availability on Viator")) {
        if (control.tagName === "A") {
          control.setAttribute("href", "#live-viator-tours");
          control.removeAttribute("target");
          control.removeAttribute("rel");
          if (label.startsWith("Check Availability on Viator") && control.firstChild) {
            control.firstChild.textContent = "Compare Live Tours ";
            const arrow = control.querySelector("span:last-child");
            if (arrow) arrow.textContent = "↓";
          }
        }
        control.dataset.liveTourTrigger = "";
      }
    });

    document.querySelectorAll("#root *").forEach((element) => {
      const text = (element.textContent || "").trim();
      if (text === "✦ 12 EDITOR'S PICKS • UPDATED 2026") element.textContent = "✦ LIVE VIATOR PICKS • UPDATED HOURLY";
      if (text === "12 picks, not 300 listings") element.textContent = "6 focused live options";
    });

    const editorial = document.querySelector("#root #tours");
    if (editorial && hideEditorial) {
      editorial.remove();
    }

    const footerCategoryRoutes = new Map([
      ["Everglades Airboat Tours", "/guides/everglades-tours-from-miami/"],
      ["Boat & Sunset Cruises", "/guides/miami-boat-tours/"],
      ["Food & Culture Walks", "/guides/little-havana-food-tours/"],
      ["City & Art Highlights", "/guides/miami-tours-for-families-couples/"],
    ]);
    let footerViatorIndex = 0;
    document.querySelectorAll("#root footer a").forEach((link) => {
      const label = (link.textContent || "").trim();
      if (footerCategoryRoutes.has(label)) {
        link.href = footerCategoryRoutes.get(label);
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.dataset.placement = `footer-guide-${label.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "")}`;
      } else if (label === "Browse on Viator" || label === "Viator Miami tours") {
        const campaign = label === "Browse on Viator"
          ? "footerPrimary2026"
          : (footerViatorIndex++ === 0 ? "footerSecondary2026" : "footerDisclosure2026");
        link.href = `${ALL_TOURS_URL}&campaign=${campaign}`;
        link.dataset.placement = campaign;
      }
    });

    const midpageAll = [...document.querySelectorAll("#root a")].find((link) => (link.textContent || "").trim().startsWith("Browse Miami Tours on Viator"));
    if (midpageAll) {
      midpageAll.href = `${ALL_TOURS_URL}&campaign=midpageAll2026`;
      midpageAll.dataset.placement = "midpage-all-tours";
    }

    const headerAll = [...document.querySelectorAll("#root header a")].find((link) => (link.textContent || "").trim() === "Viator Miami tours");
    if (headerAll) {
      headerAll.href = `${ALL_TOURS_URL}&campaign=headerAll2026`;
      headerAll.dataset.placement = "header-all-tours";
    }
    setMeta();
  };

  document.addEventListener("click", (event) => {
    const control = event.target.closest?.("[data-live-tour-trigger]");
    if (!control) return;
    const live = document.getElementById("live-viator-tours");
    if (!live) return;
    event.preventDefault();
    event.stopPropagation();
    live.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#live-viator-tours");
  }, true);

  const mount = async () => {
    if (document.getElementById("live-viator-tours")) return;
    const target = document.querySelector("#root #tours");
    if (!target) return setTimeout(mount, 250);

    const section = node("section", "viator-live");
    section.id = "live-viator-tours";
    const inner = node("div", "viator-live-inner");
    inner.appendChild(node("div", "viator-live-kicker", "Updated from Viator"));
    inner.appendChild(node("h2", "", "Miami tours with live pricing"));
    inner.appendChild(node("p", "viator-live-intro", "Six focused Miami experiences selected for strong traveler demand and category variety. Prices and availability can change; open a tour to confirm final details."));
    const status = node("div", "viator-live-status", "Loading current tour options…");
    status.setAttribute("role", "status");
    inner.appendChild(status);
    inner.appendChild(node("div", "viator-live-grid"));
    inner.appendChild(node("p", "viator-live-disclosure", "Affiliate disclosure: Miami’s Best Tours may earn a commission when you book through these links, at no extra cost to you. Viator completes the transaction and provides booking support."));
    section.appendChild(inner);
    target.before(section);
    wireFunnel();

    try {
      const response = await fetch("/.netlify/functions/viator-tours?v=20260817a", { headers: { Accept: "application/json" } });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.products) || !data.products.length) throw new Error("No products");
      const grid = section.querySelector(".viator-live-grid");
      data.products.forEach((tour, index) => grid.appendChild(card(tour, index)));
      status.remove();
      const guides = buildGuides();
      const editorial = document.querySelector("#root #tours");
      (editorial || section.nextElementSibling)?.before(guides);
      wireFunnel(true);
      setTimeout(() => wireFunnel(true), 500);
    } catch {
      status.textContent = "Live results are temporarily unavailable.";
      const fallback = node("a", "viator-live-fallback", "Browse all current Miami tours on Viator →");
      fallback.href = `${ALL_TOURS_URL}&campaign=liveFallback2026`;
      fallback.target = "_blank";
      fallback.rel = "sponsored nofollow noopener";
      fallback.dataset.placement = "home-live-fallback";
      status.after(fallback);
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();

