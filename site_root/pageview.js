// /pageview.js
(function () {
  const endpoint = '/.netlify/functions/track';
  try {
    const data = {
      path: location.pathname + location.search,
      pageUrl: location.href,
      title: document.title,
      referrer: document.referrer || ''
    };
    // Fire-and-forget
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true // try to send even on unload
    }).catch(()=>{});
  } catch (e) {
    // silently ignore
  }
})();