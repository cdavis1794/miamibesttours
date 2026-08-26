(() => {
  const measurementId = "G-CL4L1TZKX6";
  const markerKey = "mbt_internal_traffic";
  const params = new URLSearchParams(window.location.search);
  const marker = params.get("mbt_internal");

  try {
    if (marker === "1") localStorage.setItem(markerKey, "1");
    if (marker === "0") localStorage.removeItem(markerKey);
  } catch {}

  let isInternal = false;
  try {
    isInternal = localStorage.getItem(markerKey) === "1";
  } catch {}

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    ...(isInternal ? { traffic_type: "internal" } : {}),
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(script);
})();
