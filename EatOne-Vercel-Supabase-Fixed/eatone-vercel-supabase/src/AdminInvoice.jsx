import React, { useState } from "react";
import { generateInvoicePDF } from "./generateInvoicePDF.js";
import { getOrder, confirmPayment } from "./orderApi.js";

export default function AdminInvoice() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const founderName = "Manisha D Shetty";

  // ==========================================
  // FIND ORDER
  // ==========================================

  const findOrder = async () => {
    try {
      setMessage("");
      setOrder(null);

      const cleanOrderId = orderId.trim();

      if (!cleanOrderId) {
        setMessage("Please enter an Order ID.");
        return;
      }

      const found = await getOrder(cleanOrderId);

      if (!found) {
        setMessage("Order not found.");
        return;
      }

      setOrder(found);
    } catch (error) {
      console.error("Find order error:", error);

      setMessage(
        `Could not find order: ${
          error?.message || "Could not connect to the server."
        }`
      );
    }
  };

  // ==========================================
  // CONFIRM PAYMENT
  // ==========================================

  const generatePaidInvoice = async () => {
    if (!order) {
      setMessage("Please find an order first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // If invoice already exists, do not create another one
      if (order.invoiceId) {
        setMessage(
          `Invoice ${order.invoiceId} already exists. Click "Download Invoice PDF".`
        );
        return;
      }

      // Confirm payment and generate invoice ID
      const paid = await confirmPayment(order.orderId);

      if (!paid) {
        throw new Error(
          "No response received while confirming payment."
        );
      }

      if (!paid.invoiceId) {
        throw new Error(
          "Payment was confirmed, but Invoice ID was not returned."
        );
      }

      // Update order with paid status and invoice ID
      setOrder((currentOrder) => ({
  ...currentOrder,
  ...paid,
  customer: paid.customer || currentOrder.customer,
  items: paid.items || currentOrder.items,
  shippingAmount: paid.shippingAmount ?? currentOrder.shippingAmount,
  total: paid.total ?? currentOrder.total,
}));

      setMessage(
        `Payment confirmed successfully. Invoice ${paid.invoiceId} generated. Click "Download Invoice PDF" to download it.`
      );
    } catch (error) {
      console.error(
        "Payment confirmation error:",
        error
      );

      setMessage(
        `Could not confirm payment: ${
          error?.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DOWNLOAD INVOICE PDF
  // ==========================================

  const downloadInvoice = () => {
    if (!order) {
      setMessage("Please find an order first.");
      return;
    }

    if (!order.invoiceId) {
      setMessage(
        "Invoice has not been generated yet. Confirm payment first."
      );
      return;
    }

    try {
      setMessage("");

      const invoiceItems = [
        ...(Array.isArray(order.items)
          ? order.items
          : []),
      ];

      // Add shipping charges to invoice
      if (
        order.shippingAmount !== undefined &&
        order.shippingAmount !== null
      ) {
        invoiceItems.push({
          description: "Shipping Charges",
          category: "Logistics",
          quantity: "1",
          amount: Number(
            order.shippingAmount
          ),
        });
      }

      const result = generateInvoicePDF({
        status: "Paid",

        invoiceNo:
          order.invoiceId,

        orderId:
          order.orderId,

        founderName,

        customer: {
          name:
            order.customer?.name || "",

          phone:
            order.customer?.phone || "",

          line:
            order.customer?.line || "",

          pincode:
            order.customer?.pincode || "",
        },

        items:
          invoiceItems,

        total:
          Number(order.total || 0),

        deliveryPartner:
          order.deliveryPartner || "",

        trackingId:
          order.trackingId || "",
      });

      if (result !== false) {
        setMessage(
          `Invoice ${order.invoiceId} download started. Check your Downloads folder.`
        );
      } else {
        setMessage(
          "The PDF could not be generated."
        );
      }
    } catch (error) {
      console.error(
        "PDF download failed:",
        error
      );

      setMessage(
        `PDF download failed: ${
          error?.message || "Unknown error"
        }`
      );
    }
  };

  // ==========================================
  // WHATSAPP
  // ==========================================

  const sendInvoiceOnWhatsApp = () => {
    if (
      !order?.customer?.phone ||
      !order?.invoiceId
    ) {
      setMessage(
        "Customer phone number or Invoice ID is missing."
      );

      return;
    }

    const phone = String(
      order.customer.phone
    ).replace(/\D/g, "");

    const fullPhone =
      phone.length === 10
        ? `91${phone}`
        : phone;

    const whatsappMessage = [
      `Hi ${order.customer.name},`,
      "",
      "Your payment has been confirmed.",
      "",
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

  // ==========================================
  // UI
  // ==========================================

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
          After verifying GPay/UPI payment,
          enter the customer's Order ID.
        </p>

        {/* ORDER SEARCH */}

        <div className="flex gap-2 my-6">

          <input
            className="flex-1 border rounded-lg p-3"
            value={orderId}
            onChange={(e) =>
              setOrderId(
                e.target.value
              )
            }
            placeholder="EO-ORD-00001"
          />

          <button
            className="rounded-lg px-5 text-white"
            style={{
              background: "#2A2016",
            }}
            onClick={findOrder}
          >
            Find Order
          </button>

        </div>

        {/* STATUS MESSAGE */}

        {message && (
          <div
            className="p-3 rounded-lg mb-4"
            style={{
              background: "#F8F3E9",
            }}
          >
            <p>{message}</p>
          </div>
        )}

        {/* ORDER DETAILS */}

        {order && (

          <div className="space-y-2 border-t pt-5">

            <p>
              <b>Order ID:</b>{" "}
              {order.orderId}
            </p>

            <p>
              <b>Customer:</b>{" "}
              {order.customer?.name}
            </p>

            <p>
              <b>Phone:</b>{" "}
              {order.customer?.phone}
            </p>

            <p>
              <b>Address:</b>{" "}
              {order.customer?.line}
              {" - "}
              {order.customer?.pincode}
            </p>

            {/* PRODUCTS */}

            <div className="py-2">

              {Array.isArray(
                order.items
              ) &&
                order.items.map(
                  (
                    item,
                    index
                  ) => (

                    <p key={index}>

                      {item.description}

                      {" — "}

                      {item.quantity}

                      {" — Rs."}

                      {item.amount}

                    </p>

                  )
                )}

            </div>

            <p>
              <b>Shipping:</b>{" "}
              Rs.
              {order.shippingAmount}
            </p>

            <p>
              <b>Total:</b>{" "}
              Rs.
              {order.total}
            </p>

            <p>
              <b>Status:</b>{" "}
              {order.paymentStatus}
            </p>

            {/* INVOICE ID */}

            {order.invoiceId && (

              <p>
                <b>Invoice ID:</b>{" "}
                {order.invoiceId}
              </p>

            )}

            {/* CONFIRM PAYMENT */}

            {!order.invoiceId && (

              <button
                className="w-full rounded-full p-4 text-white font-bold mt-5"
                style={{
                  background:
                    "#3F6D3E",
                }}
                onClick={
                  generatePaidInvoice
                }
                disabled={loading}
              >

                {loading
                  ? "Processing..."
                  : "Confirm Payment & Generate Invoice"}

              </button>

            )}

            {/* DOWNLOAD PDF */}

            {order.invoiceId && (

              <button
                className="w-full rounded-full p-4 text-white font-bold mt-5"
                style={{
                  background:
                    "#3F6D3E",
                }}
                onClick={
                  downloadInvoice
                }
              >
                Download Invoice PDF
              </button>

            )}

            {/* WHATSAPP */}

            {order.invoiceId && (

              <button
                className="w-full rounded-full p-4 text-white font-bold mt-3"
                style={{
                  background:
                    "#2A2016",
                }}
                onClick={
                  sendInvoiceOnWhatsApp
                }
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
