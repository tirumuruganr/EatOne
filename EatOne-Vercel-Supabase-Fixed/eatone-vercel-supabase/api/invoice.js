const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function headers(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function db(path, options = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: headers(options.headers || {}),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(text || `Supabase error ${r.status}`);
  return text ? JSON.parse(text) : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Supabase environment variables are not configured." });
  }

  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "Order ID is required." });

    // Atomic DB function generates a separate sequential invoice number and marks paid.
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/mark_order_paid_and_invoice`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ p_order_id: orderId }),
    });
    const text = await r.text();
    if (!r.ok) throw new Error(text || "Invoice generation failed");
    const result = text ? JSON.parse(text) : null;

    return res.status(200).json({
      orderId,
      invoiceId: result?.invoice_id || result?.[0]?.invoice_id || result,
      paymentStatus: "paid",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Invoice generation failed.", details: error.message });
  }
}
