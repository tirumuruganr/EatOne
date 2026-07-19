import React, { useState } from "react";
import { generateInvoicePDF } from "./generateInvoicePDF.js";
import { getOrder, confirmPayment } from "./orderApi.js";

export default function AdminInvoice() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const founderName = "Manisha D Shetty";

  // Find order
  const findOrder = async () => {
    try {
      setMessage("");
      setOrder(null);

      const found = await getOrder(orderId);

      if (!found) {
        setMessage("Order not found.");
        return;
      }

      setOrder(found);
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the server.");
    }
  };

  // Generate PDF
  const downloadInvoice = (invoiceOrder) => {
    if (!invoiceOrder?.invoiceId) {
      setMessage("Invoice ID is missing.");
      return;
    }

    generateInvoicePDF({
      status: "Paid",
      invoiceNo: invoiceOrder.invoiceId,
      orderId: invoiceOrder.orderId,
      founderName,

      customer: invoiceOrder.customer,

      items: [
        ...invoiceOrder.items,
        {
          description: "Shipping Charges",
          category: "Logistics",
          quantity: "1",
          amount: invoiceOrder.shippingAmount,
        },
      ],

      total: invoiceOrder.total,
    });
  };

  // Confirm payment and generate invoice
  const generatePaidInvoice = async () => {
    if (!order) return;

    try {
      setLoading(true);
      setMessage("");

      // If invoice already exists, just download again
      if (order.invoiceId) {
        downloadInvoice(order);
        return;
      }

      // Confirm payment in Supabase
      const paid = await confirmPayment(order.orderId);

      if (!paid?.invoiceId) {
        throw new Error("Invoice ID was not returned.");
      }

      // Update UI
      setOrder(paid);

      // Generate and download PDF
      downloadInvoice(paid);

      setMessage(
        `Payment confirmed. Invoice ${paid.invoiceId} has been generated and downloaded.`
      );

    } catch (error) {
      console.error("Invoice generation error:", error);

      setMessage(
        `Could not generate invoice: ${error.message || "Unknown error"}`
      );

    } finally {
      setLoading(false);
    }
  };

  // Open WhatsApp confirmation
  const sendInvoiceOnWhatsApp = () => {
    if (!order?.customer?.phone || !order?.invoiceId) {
      setMessage("Customer phone number or Invoice ID is missing.");
      return;
    }

    const phone = String(order.customer.phone).replace(/\D/g, "");

    const fullPhone =
      phone.length === 10
        ? `91${phone}`
        : phone;

    const whatsappMessage = [
      `Hi ${order.customer.name},`,
      "",
      "Your payment has been confirmed.",
      `Order ID: ${order.orderId}`,
      `Invoice No: ${order.invoiceId}`,
      `Total: Rs.${order.total}`,
      "",
      "Your EAT ONE invoice has been generated.",
      "",
      "Thank you for ordering from EAT ONE.",
    ].join("\n");

    window.open(
      `https://wa.me/${fullPhone}?text=${encodeURIComponent(
        whatsappMessage
      )}`,
      "_blank"
    );
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background: "#F8F3E9",
        color: "#2A2016",
      }}
    >
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-sm">

        <h1 className="text-2xl font-bold">
          EAT ONE — Order & Invoice Admin
        </h1>

        <p className="text-sm opacity-70 mt-2">
          After verifying GPay/UPI payment, enter the customer's Order ID.
        </p>

        <div className="flex gap-2 my-6">

          <input
            className="flex-1 border rounded-lg p-3"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="EO-ORD-00001"
          />

          <button
            className="rounded-lg px-5 text-white"
            style={{ background: "#2A2016" }}
            onClick={findOrder}
          >
            Find Order
          </button>

        </div>

        {message && (
          <p className="my-3 font-medium">
            {message}
          </p>
        )}

        {order && (

          <div className="space-y-2 border-t pt-5">

            <p>
              <b>Order ID:</b> {order.orderId}
            </p>

            <p>
              <b>Customer:</b> {order.customer.name}
            </p>

            <p>
              <b>Phone:</b> {order.customer.phone}
            </p>

            <p>
              <b>Address:</b>{" "}
              {order.customer.line} - {order.customer.pincode}
            </p>

            <div className="py-2">

              {order.items.map((item, index) => (

                <p key={index}>
                  {item.description}
                  {" — "}
                  {item.quantity}
                  {" — "}
                  Rs.{item.amount}
                </p>

              ))}

            </div>

            <p>
              <b>Shipping:</b> Rs.{order.shippingAmount}
            </p>

            <p>
              <b>Total:</b> Rs.{order.total}
            </p>

            <p>
              <b>Status:</b> {order.paymentStatus}
            </p>

            {order.invoiceId && (

              <p>
                <b>Invoice ID:</b> {order.invoiceId}
              </p>

            )}

            <button
              className="w-full rounded-full p-4 text-white font-bold mt-5"
              style={{ background: "#3F6D3E" }}
              onClick={generatePaidInvoice}
              disabled={loading}
            >

              {loading
                ? "Processing..."
                : order.invoiceId
                ? "Download Paid Invoice Again"
                : "Confirm Payment & Generate Invoice"}

            </button>

            {order.invoiceId && (

              <button
                className="w-full rounded-full p-4 text-white font-bold mt-3"
                style={{ background: "#2A2016" }}
                onClick={sendInvoiceOnWhatsApp}
              >

                Send Confirmation via WhatsApp

              </button>

            )}

          </div>

        )}

      </div>
    </div>
  );
}
