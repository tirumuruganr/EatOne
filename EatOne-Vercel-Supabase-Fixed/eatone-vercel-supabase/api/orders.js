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

async function supabase(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: headers(options.headers || {}),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase error ${response.status}`);
  return text ? JSON.parse(text) : null;
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Supabase environment variables are not configured." });
  }

  try {
    if (req.method === "POST") {
      const { customer, items, shippingAmount, total } = req.body || {};
      if (!customer || !Array.isArray(items) || !items.length) {
        return res.status(400).json({ error: "Invalid order data." });
      }

      const rows = await supabase("orders?select=*", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          customer,
          items,
          shipping_amount: Number(shippingAmount || 0),
          total: Number(total || 0),
          payment_status: "pending",
        }),
      });

      const order = rows?.[0];
      return res.status(201).json({
        orderId: order.order_id,
        order: {
          ...order,
          orderId: order.order_id,
          shippingAmount: order.shipping_amount,
          paymentStatus: order.payment_status,
        },
      });
    }

    if (req.method === "GET") {
      const orderId = String(req.query.orderId || "").trim();
      if (!orderId) return res.status(400).json({ error: "Order ID is required." });

      const rows = await supabase(
        `orders?order_id=eq.${encodeURIComponent(orderId)}&select=*`
      );
      const order = rows?.[0];
      if (!order) return res.status(404).json({ error: "Order not found." });

      return res.status(200).json({
        ...order,
        orderId: order.order_id,
        shippingAmount: order.shipping_amount,
        paymentStatus: order.payment_status,
        invoiceId: order.invoice_id,
      });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Order operation failed.", details: error.message });
  }
}
