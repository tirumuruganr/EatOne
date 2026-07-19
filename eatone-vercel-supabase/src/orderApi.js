const API_BASE = "/api";

export async function createOrder(order) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error("Could not create order");
  return res.json();
}
export async function getOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId.trim())}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Could not fetch order");
  return res.json();
}
export async function confirmPayment(orderId) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/confirm-payment`, { method: "POST" });
  if (!res.ok) throw new Error("Could not confirm payment");
  return res.json();
}
