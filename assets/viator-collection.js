(() => {
  const root = document.getElementById("focused-live-tours");
  if (!root) return;

  const collection = root.dataset.collection || "home";
  const grid = root.querySelector("[data-tour-grid]");
  const status = root.querySelector("[data-tour-status]");
  const updated = root.querySelector("[data-tour-updated]");

  const money = (amount, currency) => {
    if (typeof amount !== "number") return "Check price";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `$${Math.round(amount)}`;
    }
  };

  const optimizedImage = (url, width) =>
    `/.netlify/images?url=${encodeURIComponent(url)}&w=${width}&h=${Math.round(width * 2 / 3)}&fit=cover&q=70`;

  const element = (tag, className, text) => {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (text !== undefined) result.textContent = text;
    return result;
  };

  const buildCard = (tour) => {
    const article = element("article", "focused-tour-card");
    article.dataset.productView = "";
    article.dataset.product = tour.code || tour.title;
    article.dataset.placement = tour.placement || `${collection}-live`;

    if (tour.image) {
      const image = document.createElement("img");
      image.src = optimizedImage(tour.image, 520);
      image.srcset = `${optimizedImage(tour.image, 360)} 360w, ${optimizedImage(tour.image, 520)} 520w, ${optimizedImage(tour.image, 720)} 720w`;
      image.sizes = "(min-width: 760px) 390px, calc(100vw - 60px)";
      image.alt = `${tour.title} in Miami`;
      image.width = 520;
      image.height = 347;
      image.loading = "lazy";
      image.decoding = "async";
      article.appendChild(image);
    }

    const body = element("div", "focused-tour-card__body");
    body.appendChild(element("span", "focused-tour-card__category", tour.category || "Miami option"));
    body.appendChild(element("h3", "", tour.title));

    if (tour.fit) body.appendChild(element("p", "focused-tour-card__fit", tour.fit));

    const facts = element("div", "focused-tour-card__facts");
    if (tour.rating) {
      const reviews = tour.reviews ? ` · ${Number(tour.reviews).toLocaleString()} reviews` : "";
      facts.appendChild(element("span", "", `★ ${Number(tour.rating).toFixed(1)}${reviews}`));
    }
    if (tour.duration) facts.appendChild(element("span", "", `⏱ ${tour.duration}`));
    facts.appendChild(element("span", "", `From ${money(tour.price, tour.currency)}`));
    body.appendChild(facts);

    const link = element("a", "focused-tour-card__button", "Check live details on Viator →");
    link.href = tour.url;
    link.target = "_blank";
    link.rel = "sponsored nofollow noopener";
    link.dataset.product = tour.code || tour.title;
    link.dataset.placement = tour.placement || `${collection}-live`;
    link.setAttribute("aria-label", `Check current details for ${tour.title} on Viator`);
    body.appendChild(link);
    article.appendChild(body);
    return article;
  };

  const load = async () => {
    try {
      const response = await fetch(`/.netlify/functions/viator-tours?collection=${encodeURIComponent(collection)}&v=20260822a`, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.products) || !data.products.length) throw new Error("No products");

      const fragment = document.createDocumentFragment();
      data.products.forEach((tour) => fragment.appendChild(buildCard(tour)));
      grid.replaceChildren(fragment);
      status?.remove();
      if (updated && data.updatedAt) {
        updated.textContent = `Live inventory checked ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(data.updatedAt))}`;
      }
    } catch {
      if (status) status.textContent = "Live product details are temporarily unavailable. Use the Viator link below to check current inventory.";
    }
  };

  load();
})();
