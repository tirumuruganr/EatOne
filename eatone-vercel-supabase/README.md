# EAT ONE — local setup

## Requirements
- Node.js 18+ installed (check with `node -v`)

## Run it
```bash
npm install
npm run dev
```
Then open the URL it prints (usually http://localhost:5173).

## Build for deployment
```bash
npm run build
```
This creates a `dist/` folder you can deploy to Vercel, Netlify, GitHub Pages, etc.

## Before going live, edit src/App.jsx:
- `WHATSAPP_NUMBER` / `WHATSAPP_DISPLAY` — your real WhatsApp number
- Product taglines and testimonials — marked with "placeholder" comments
- `BRAND_LOGO` — currently points to the reference site's logo URL; download it and host your own copy instead
