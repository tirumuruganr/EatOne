import jsPDF from "jspdf";

const BROWN = [42, 32, 22];
const GREEN = [63, 109, 62];
const BRAND_TAGLINE = "Healthy Delight Everyday";

/**
 * Generates the EAT ONE invoice PDF and triggers a download.
 *
 * @param {Object} params
 * @param {"Pending Payment"|"Paid"} params.status
 * @param {string} params.invoiceNo
 * @param {string} params.founderName
 * @param {{name:string, phone:string, line:string, pincode:string}} params.customer
 * @param {Array<{description:string, category:string, quantity:string, amount:number|null}>} params.items
 *        Each row of the table. Use amount:null to print "TBC".
 * @param {number} params.total
 * @param {string} [params.deliveryPartner]  e.g. "Delhivery", "India Post" — only printed if provided
 * @param {string} [params.trackingId]       only printed if provided
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
  const doc = new jsPDF();
  const pageWidth = 210;
  let y;

  // Top brand bar
  doc.setFillColor(...BROWN);
  doc.rect(0, 0, pageWidth, 8, "F");

  // Logo wordmark (text-based — avoids cross-origin image issues in the PDF)
  doc.setFont(undefined, "bold");
  doc.setFontSize(26);
  doc.setTextColor(...BROWN);
  doc.text("Eat", 14, 32);
  const eatWidth = doc.getTextWidth("Eat");
  doc.setTextColor(...GREEN);
  doc.text("One", 14 + eatWidth + 2, 32);
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.text(BRAND_TAGLINE.toUpperCase(), 14, 39);

  // Invoice meta, top-right
  doc.setFontSize(10);
  doc.setTextColor(...BROWN);
  doc.setFont(undefined, "bold");
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(dateStr, 196, 24, { align: "right" });
  doc.text(`Invoice No. ${invoiceNo}`, 196, 30, { align: "right" });
  if (orderId) doc.text(`Order ID: ${orderId}`, 196, 36, { align: "right" });
  doc.text(`Status: ${status}`, 196, orderId ? 42 : 36, { align: "right" });

  y = 46;
  doc.setLineWidth(0.3);
  doc.setDrawColor(...BROWN);
  doc.line(14, y, 196, y);
  y += 10;

  // Billed to
  doc.setFont(undefined, "bold");
  doc.setFontSize(11);
  doc.text("Billed to:", 14, y);
  y += 7;
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(customer.name || "-", 14, y);
  y += 6;
  const billedAddrLines = doc.splitTextToSize(customer.line || "-", 180);
  doc.text(billedAddrLines, 14, y);
  y += 6 * billedAddrLines.length;
  doc.text(`Pincode: ${customer.pincode || "-"}`, 14, y);
  y += 6;
  doc.text(`+91 ${customer.phone || "-"}`, 14, y);
  y += 8;
  doc.line(14, y, 196, y);
  y += 12;

  // Table header
  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  doc.text("Description", 14, y);
  doc.text("Category", 90, y);
  doc.text("Quantity", 135, y);
  doc.text("Amount", 175, y, { align: "right" });
  y += 3;
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFont(undefined, "normal");
  items.forEach((row) => {
    const descLines = doc.splitTextToSize(row.description, 72);
    doc.text(descLines, 14, y);
    doc.text(row.category || "-", 90, y);
    doc.text(row.quantity || "-", 135, y);
    doc.text(row.amount !== null && row.amount !== undefined ? `Rs.${row.amount}` : "TBC", 175, y, { align: "right" });
    y += Math.max(7, 6 * descLines.length);
  });

  y += 1;
  doc.setLineWidth(0.4);
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("Total", 14, y);
  doc.text(`Rs.${total}`, 175, y, { align: "right" });
  y += 8;
  doc.line(14, y, 196, y);
  y += 14;

  // Shipping details (only if provided — i.e. once the order has actually shipped)
  if (deliveryPartner || trackingId) {
    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text("Shipping Details", 14, y);
    y += 6;
    doc.setFont(undefined, "normal");
    if (deliveryPartner) {
      doc.text(`Delivery Partner: ${deliveryPartner}`, 14, y);
      y += 6;
    }
    if (trackingId) {
      doc.text(`Tracking ID: ${trackingId}`, 14, y);
      y += 6;
    }
    y += 6;
    doc.line(14, y, 196, y);
    y += 12;
  } else {
    y += 6;
  }

  // Tagline
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(...BROWN);
  doc.text(BRAND_TAGLINE, pageWidth / 2, y, { align: "center" });
  y += 10;
  doc.setFont(undefined, "normal");
  doc.line(14, y, 196, y);
  y += 12;

  // Issued by
  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  doc.text("Issued By", 14, y);
  y += 6;
  doc.setFont(undefined, "normal");
  doc.text(founderName, 14, y);

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.text(founderName, 165, y - 4, { align: "right" });
  y += 3;
  doc.line(140, y, 196, y);
  y += 5;
  doc.setFont(undefined, "bold");
  doc.setFontSize(9);
  doc.text("Founder", 196, y, { align: "right" });

  // Bottom brand bar
  doc.setFillColor(...GREEN);
  doc.rect(0, 289, pageWidth, 8, "F");

  const pdfBlob = doc.output("blob");
const pdfUrl = URL.createObjectURL(pdfBlob);

const link = document.createElement("a");
link.href = pdfUrl;
link.download = `EatOne-Invoice-${invoiceNo}.pdf`;

document.body.appendChild(link);
link.click();
document.body.removeChild(link);

setTimeout(() => {
  URL.revokeObjectURL(pdfUrl);
}, 1000);




  // Bottom brand bar
doc.setFillColor(...GREEN);
doc.rect(0, 289, pageWidth, 8, "F");

// Force PDF download
const pdfBlob = doc.output("blob");
const pdfUrl = URL.createObjectURL(pdfBlob);

const link = document.createElement("a");
link.href = pdfUrl;
link.download = `EatOne-Invoice-${invoiceNo}.pdf`;

document.body.appendChild(link);
link.click();
document.body.removeChild(link);

setTimeout(() => {
  URL.revokeObjectURL(pdfUrl);
}, 1000);
}
