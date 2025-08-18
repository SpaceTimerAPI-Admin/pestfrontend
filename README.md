# Netlify Pageview → Discord Alerts (with IP + timestamp)

## What this does
- Sends a Discord message for **every pageview** on your Netlify site.
- Includes: **URL, title, UTC timestamp, IP, device type, user agent, referrer**.

## Files to add to your repo
```
/netlify/functions/track.js   # serverless function
/pageview.js                  # client script you include on every page
/netlify.toml                 # ensure Netlify sees the functions dir
```

## Setup on Netlify
1. Go to **Site settings → Environment variables** and add:
   - `DISCORD_WEBHOOK_URL` = your webhook URL
2. Redeploy the site.

## Add the tracker to each page
Put this in the `<head>` or right before `</body>` of every HTML page:
```html
<script src="/pageview.js" defer></script>
```

That’s it. When a visitor loads any page, the browser will POST to
`/.netlify/functions/track`, which sends your Discord alert.

### Notes
- We read IP from `x-forwarded-for` (set by Netlify’s edge) and format as the first address.
- CORS is permissive by default; update `Access-Control-Allow-Origin` to your Netlify URL to restrict.
- If you want to exclude bots, add a simple UA filter in the function.
