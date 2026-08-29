(() => {
  const replacements = [
    {
      match:
        "Disclosure: MiamiBestTours.tours is a Viator affiliate. We earn a commission when you book via our links (PID P00161591, MCID 42383) at no extra cost to you. All tours are operated by Viator partners. Prices, times, and availability via Viator. Booking link:",
      replacement:
        "Disclosure: MiamiBestTours.tours is an independent Viator affiliate. We may earn a commission at no extra cost to you. Tour operators set prices, schedules, availability, and booking terms. Booking link:",
    },
    {
      match:
        ". Domain: https://miamibesttours.tours/ secured via Netlify DNS + Let's Encrypt HTTPS. Made for light, island, luxury getaways.",
      replacement: ".",
    },
    {
      match: "© 2026 Miami's Best Tours • Light Theme • All light backgrounds",
      replacement:
        "© 2026 Miami's Best Tours • Independent Miami tour research",
    },
  ];

  function cleanRenderedContent() {
    const root = document.getElementById('root');
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      for (const { match, replacement } of replacements) {
        if (node.nodeValue?.includes(match)) {
          node.nodeValue = node.nodeValue.replace(match, replacement);
        }
      }
    }

    root.querySelectorAll('.sr-only').forEach((element) => {
      if (element.textContent?.includes('Best Miami Tours 2026 Luxury Island Guide')) {
        element.remove();
      }
    });
  }

  cleanRenderedContent();
  const observer = new MutationObserver(() => {
    observer.disconnect();
    cleanRenderedContent();
    observer.observe(document.body, { childList: true, subtree: true });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
