(() => {
  const links = '<nav class="site-trust-links" aria-label="Company and policy links"><a href="/blog/">All guides</a><a href="/about/">Editorial standards</a><a href="/authors/miami-best-tours-editorial-team/">Research team</a><a href="/contact/">Corrections</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/affiliate-disclosure/">Affiliate disclosure</a><a href="/refund-policy/">Refund policy</a></nav>';
  const place = () => {
    const footer = document.querySelector('#root footer');
    const hub = document.getElementById('miami-guides');
    const blogBar = document.querySelector('.site-blog-bar');
    if (footer && hub && hub.nextElementSibling !== footer) footer.before(hub);
    if (blogBar) blogBar.hidden = false;
    if (footer && hub) hub.hidden = false;
    if (footer && !footer.querySelector('.site-trust-links')) {
      const target = footer.querySelector('[class*="border-t"]') || footer.lastElementChild || footer;
      target.insertAdjacentHTML('beforeend', links);
    }
    if (footer) {
      const description = [...footer.querySelectorAll('p')].find(element => element.textContent.includes("We rank only what we'd book ourselves"));
      if (description) description.textContent = "An independent Miami tour research guide. We compare traveler fit, route logistics, provider details, and current terms; provider-researched and first-hand claims are labeled separately.";
    }
  };
  const settle = () => {
    let attempts = 0;
    const retry = () => {
      place();
      if (attempts++ < 20 && !document.querySelector('#root footer')) setTimeout(retry, 250);
    };
    retry();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', settle); else settle();
})();
