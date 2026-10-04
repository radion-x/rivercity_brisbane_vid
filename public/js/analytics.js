(() => {
  const hosts = {"rivercityhandyman.com.au": "GTM-59H8LBFN", "www.rivercityhandyman.com.au": "GTM-59H8LBFN"};
  const container = hosts[window.location.hostname];
  if (!container || /^\/(admin|api)(\/|$)/.test(window.location.pathname) || window.handymanAnalytics || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
  window.dataLayer = window.dataLayer || [];
  function push(event) { window.dataLayer.push({ event }); }
  window.handymanAnalytics = { lead: () => push('generate_lead') };
  document.addEventListener('click', (event) => {
    const link = event.target.closest && event.target.closest('a[href^="tel:"]');
    if (link) push('phone_click');
  });
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(container);
  document.head.appendChild(tag);
})();
