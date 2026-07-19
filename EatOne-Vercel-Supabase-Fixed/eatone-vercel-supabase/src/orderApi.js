const API_BASE = "/api";

async function readJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.details || data?.error || `Request failed (${res.status})`);
  return data;
}

export async function createOrder(order) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  return readJson(res);
}

export async function getOrder(orderId) {
  const id = encodeURIComponent(orderId.trim());
  const res = await fetch(`${API_BASE}/orders?orderId=${id}`);
  if (res.status === 404) return null;
  return readJson(res);
}

export async function confirmPayment(orderId) {
  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  return readJson(res);
}
