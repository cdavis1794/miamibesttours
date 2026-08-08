(() => {
  const links = '<nav class="site-trust-links" aria-label="Company and policy links"><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/affiliate-disclosure/">Affiliate disclosure</a><a href="/refund-policy/">Refund policy</a></nav>';
  const place = () => {
    const footer = document.querySelector('#root footer');
    const hub = document.getElementById('miami-guides');
    const blogBar = document.querySelector('.site-blog-bar');
    if (footer && blogBar && blogBar.nextElementSibling !== hub) footer.before(blogBar);
    if (footer && hub && hub.nextElementSibling !== footer) footer.before(hub);
    if (blogBar) blogBar.hidden = false;
    if (hub) hub.hidden = false;
    if (footer && !footer.querySelector('.site-trust-links')) {
      const target = footer.querySelector('[class*="border-t"]') || footer.lastElementChild || footer;
      target.insertAdjacentHTML('beforeend', links);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place); else place();
  setTimeout(place, 600);
})();
