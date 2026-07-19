# EAT ONE — Vercel + Supabase

This version stores orders permanently in Supabase instead of `data.json`.

## 1. Create Supabase project
Create a project in Supabase.

## 2. Create database
Open Supabase -> SQL Editor.
Copy and run all SQL from:

`supabase-schema.sql`

This creates:
- Sequential Order IDs: `EO-ORD-00001`, `EO-ORD-00002`, ...
- Sequential Invoice IDs: `EO-INV-00001`, `EO-INV-00002`, ...
- Permanent order storage.
- Payment status and invoice association.

## 3. Deploy to Vercel
Import this project into Vercel.

In Vercel Project Settings -> Environment Variables add:

`SUPABASE_URL`
`SUPABASE_SERVICE_ROLE_KEY`

Use the values from your Supabase project.

IMPORTANT: The Service Role Key is used only inside `/api` serverless functions.
Never put it in a `VITE_...` environment variable and never expose it in frontend code.

Redeploy after adding environment variables.

## Workflow
1. Customer clicks Order via WhatsApp.
2. `/api/orders` creates and permanently saves the order in Supabase.
3. Supabase generates the sequential `EO-ORD-xxxxx`.
4. The same Order ID is included in WhatsApp.
5. Admin copies the Order ID and searches it.
6. Admin confirms payment.
7. `/api/invoice` atomically generates a separate sequential `EO-INV-xxxxx`.
8. Order and invoice relationship remains permanently stored in Supabase.

## Local development
Vercel serverless `/api` functions are best tested with Vercel CLI (`vercel dev`).
Alternatively deploy a Preview Deployment to Vercel and test there.

Do not use the old `npm run server`; this build no longer uses `data.json` or `server.js`.
