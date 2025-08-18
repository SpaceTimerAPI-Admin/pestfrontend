// /.netlify/functions/track.js
// Sends a Discord alert for each pageview.
// Configure DISCORD_WEBHOOK_URL in Netlify → Site settings → Environment variables.

export async function handler(event, context) {
  try {
    // Only allow POST from browser
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Basic CORS (allow from anywhere; tighten to your site in production)
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: 'ok' };
    }

    const body = JSON.parse(event.body || '{}');
    const ua = event.headers['user-agent'] || '';
    const referer = event.headers['referer'] || body.referrer || '';
    const host = event.headers['host'] || '';
    const forwardedFor = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '';
    const ip = String(forwardedFor).split(',')[0].trim() || 'unknown';
    const proto = event.headers['x-forwarded-proto'] || 'https';

    const urlPath = body.path || '/';
    const pageUrl = body.pageUrl || `${proto}://${host}${urlPath}`;
    const pageTitle = body.title || '';

    const when = new Date().toISOString(); // UTC timestamp

    const device = /mobile|iphone|ipod|android(?!.*tablet)/i.test(ua) ? 'Mobile'
                 : /ipad|tablet/i.test(ua) ? 'Tablet'
                 : 'Desktop';

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) {
      return { statusCode: 500, headers, body: 'Missing DISCORD_WEBHOOK_URL' };
    }

    const lines = [
      `🔔 **Pageview**`,
      `URL: ${pageUrl}`,
      pageTitle ? `Title: ${pageTitle}` : null,
      `Time (UTC): ${when}`,
      `IP: ${ip}`,
      `Device: ${device}`,
      ua ? `UA: ${ua.substring(0, 200)}` : null,
      referer ? `Referrer: ${referer}` : null,
    ].filter(Boolean).join('\n');

    const payload = { content: lines };

    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: 502, headers, body: 'Discord error: ' + txt };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: 'Server error: ' + (e?.message || String(e)) };
  }
}
