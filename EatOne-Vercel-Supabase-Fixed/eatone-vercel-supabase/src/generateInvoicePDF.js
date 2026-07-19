import jsPDF from "jspdf";

const BROWN = [42, 32, 22];
const GREEN = [63, 109, 62];
const BRAND_TAGLINE = "Healthy Delight Everyday";

/**
 * Generates the EAT ONE invoice PDF and automatically downloads it.
 *
 * @param {Object} params
 * @param {"Pending Payment"|"Paid"} params.status
 * @param {string} params.invoiceNo
 * @param {string} params.orderId
 * @param {string} params.founderName
 * @param {{name:string, phone:string, line:string, pincode:string}} params.customer
 * @param {Array<{
 *   description:string,
 *   category:string,
 *   quantity:string,
 *   amount:number|null
 * }>} params.items
 * @param {number} params.total
 * @param {string} [params.deliveryPartner]
 * @param {string} [params.trackingId]
 */
export function generateInvoicePDF({
  status,
  invoiceNo,
  orderId,
  founderName,
  customer,
  items,
  total,
  deliveryPartner,
  trackingId,
}) {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    let y;

    // ==========================================
    // TOP BRAND BAR
    // ==========================================

    doc.setFillColor(...BROWN);
    doc.rect(0, 0, pageWidth, 8, "F");

    // ==========================================
    // EAT ONE LOGO / WORDMARK
    // ==========================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);

    doc.setTextColor(...BROWN);
    doc.text("Eat", 14, 32);

    const eatWidth = doc.getTextWidth("Eat");

    doc.setTextColor(...GREEN);
    doc.text("One", 14 + eatWidth + 2, 32);

    // Brand tagline
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GREEN);

    doc.text(
      BRAND_TAGLINE.toUpperCase(),
      14,
      39
    );

    // ==========================================
    // INVOICE INFORMATION
    // ==========================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BROWN);

    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    doc.text(dateStr, 196, 24, {
      align: "right",
    });

    doc.text(
      `Invoice No. ${invoiceNo || "-"}`,
      196,
      30,
      {
        align: "right",
      }
    );

    if (orderId) {
      doc.text(
        `Order ID: ${orderId}`,
        196,
        36,
        {
          align: "right",
        }
      );
    }

    doc.text(
      `Status: ${status || "-"}`,
      196,
      orderId ? 42 : 36,
      {
        align: "right",
      }
    );

    // ==========================================
    // DIVIDER
    // ==========================================

    y = 46;

    doc.setLineWidth(0.3);
    doc.setDrawColor(...BROWN);
    doc.line(14, y, 196, y);

    y += 10;

    // ==========================================
    // BILLED TO
    // ==========================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...BROWN);

    doc.text("Billed to:", 14, y);

    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      customer?.name || "-",
      14,
      y
    );

    y += 6;

    const billedAddrLines =
      doc.splitTextToSize(
        customer?.line || "-",
        180
      );

    doc.text(
      billedAddrLines,
      14,
      y
    );

    y += 6 * billedAddrLines.length;

    doc.text(
      `Pincode: ${customer?.pincode || "-"}`,
      14,
      y
    );

    y += 6;

    let phone = customer?.phone || "-";

    // Prevent duplicate +91
    if (
      phone !== "-" &&
      !String(phone).startsWith("+91")
    ) {
      phone = `+91 ${phone}`;
    }

    doc.text(
      `${phone}`,
      14,
      y
    );

    y += 8;

    doc.line(
      14,
      y,
      196,
      y
    );

    y += 12;

    // ==========================================
    // TABLE HEADER
    // ==========================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "Description",
      14,
      y
    );

    doc.text(
      "Category",
      90,
      y
    );

    doc.text(
      "Quantity",
      135,
      y
    );

    doc.text(
      "Amount",
      190,
      y,
      {
        align: "right",
      }
    );

    y += 3;

    doc.line(
      14,
      y,
      196,
      y
    );

    y += 8;

    // ==========================================
    // PRODUCT ITEMS
    // ==========================================

    doc.setFont(
      "helvetica",
      "normal"
    );

    (items || []).forEach(
      (row) => {

        const descLines =
          doc.splitTextToSize(
            row.description || "-",
            72
          );

        doc.text(
          descLines,
          14,
          y
        );

        doc.text(
          row.category || "-",
          90,
          y
        );

        doc.text(
          String(
            row.quantity || "-"
          ),
          135,
          y
        );

        const amountText =
          row.amount !== null &&
          row.amount !== undefined
            ? `Rs. ${row.amount}`
            : "TBC";

        doc.text(
          amountText,
          190,
          y,
          {
            align: "right",
          }
        );

        y += Math.max(
          7,
          6 * descLines.length
        );
      }
    );

    // ==========================================
    // TOTAL
    // ==========================================

    y += 1;

    doc.setLineWidth(0.4);

    doc.line(
      14,
      y,
      196,
      y
    );

    y += 8;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(12);

    doc.text(
      "Total",
      14,
      y
    );

    doc.text(
      `Rs. ${total ?? 0}`,
      190,
      y,
      {
        align: "right",
      }
    );

    y += 8;

    doc.line(
      14,
      y,
      196,
      y
    );

    y += 14;

    // ==========================================
    // SHIPPING DETAILS
    // ==========================================

    if (
      deliveryPartner ||
      trackingId
    ) {

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(10);

      doc.text(
        "Shipping Details",
        14,
        y
      );

      y += 6;

      doc.setFont(
        "helvetica",
        "normal"
      );

      if (deliveryPartner) {

        doc.text(
          `Delivery Partner: ${deliveryPartner}`,
          14,
          y
        );

        y += 6;
      }

      if (trackingId) {

        doc.text(
          `Tracking ID: ${trackingId}`,
          14,
          y
        );

        y += 6;
      }

      y += 6;

      doc.line(
        14,
        y,
        196,
        y
      );

      y += 12;

    } else {

      y += 6;
    }

    // ==========================================
    // BRAND TAGLINE
    // Sans-serif italic
    // ==========================================

    doc.setFont(
      "helvetica",
      "italic"
    );

    doc.setFontSize(13);

    doc.setTextColor(
      ...BROWN
    );

    doc.text(
      BRAND_TAGLINE,
      pageWidth / 2,
      y,
      {
        align: "center",
      }
    );

    y += 10;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.line(
      14,
      y,
      196,
      y
    );

    y += 12;

    // ==========================================
    // ISSUED BY
    // ==========================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "Issued By",
      14,
      y
    );

    y += 6;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      founderName || "-",
      14,
      y
    );

    // ==========================================
    // FOUNDER SIGNATURE
    // ==========================================
    //
    // Currently using Helvetica Italic.
    //
    // Once Brilliant Signature J font is
    // embedded, change this to:
    //
    // doc.setFont(
    //   "BrilliantSignatureJ",
    //   "normal"
    // );
    //
    // ==========================================

    doc.setFont(
      "helvetica",
      "italic"
    );

    doc.setFontSize(16);

    doc.text(
      founderName || "",
      196,
      y - 4,
      {
        align: "right",
      }
    );

    y += 3;

    doc.setDrawColor(
      ...BROWN
    );

    doc.line(
      140,
      y,
      196,
      y
    );

    y += 5;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.text(
      "Founder",
      196,
      y,
      {
        align: "right",
      }
    );

    // ==========================================
    // BOTTOM BRAND BAR
    // ==========================================

    doc.setFillColor(
      ...GREEN
    );

    doc.rect(
      0,
      289,
      pageWidth,
      8,
      "F"
    );

    // ==========================================
    // FORCE PDF DOWNLOAD
    // ==========================================

    const safeInvoiceNo =
      invoiceNo ||
      "Invoice";

    const pdfBlob =
      doc.output("blob");

    const pdfUrl =
      URL.createObjectURL(
        pdfBlob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      pdfUrl;

    link.download =
      `EatOne-Invoice-${safeInvoiceNo}.pdf`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    // Release memory after download
    setTimeout(() => {
      URL.revokeObjectURL(
        pdfUrl
      );
    }, 2000);

    return true;

  } catch (error) {

    console.error(
      "Invoice PDF generation failed:",
      error
    );

    alert(
      `Could not generate invoice PDF: ${
        error?.message ||
        "Unknown error"
      }`
    );

    return false;
  }
}
