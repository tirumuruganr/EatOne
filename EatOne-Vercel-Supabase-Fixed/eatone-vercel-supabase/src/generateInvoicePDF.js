import jsPDF from "jspdf";

const BROWN = [42, 32, 22];
const GREEN = [63, 109, 62];
const BRAND_TAGLINE = "Healthy Delight Everyday";

// ============================================================
// LOAD FILE FROM PUBLIC FOLDER AS BASE64
// ============================================================
async function loadFileAsBase64(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not load file: ${url}`);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let binary = "";

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

// ============================================================
// LOAD IMAGE FROM PUBLIC FOLDER AS DATA URL
// ============================================================
async function loadImageAsDataURL(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not load image: ${url}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}

// ============================================================
// GENERATE INVOICE
// ============================================================
export async function generateInvoicePDF({
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
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Safe defaults
  const safeCustomer = customer || {};
  const safeItems = Array.isArray(items) ? items : [];
  const safeTotal = Number(total || 0);

  // ============================================================
  // LOAD POPPINS FONT
  // ============================================================
  try {
    const poppinsBase64 = await loadFileAsBase64(
      "/Poppins-Medium.ttf"
    );

    doc.addFileToVFS(
      "Poppins-Medium.ttf",
      poppinsBase64
    );

    doc.addFont(
      "Poppins-Medium.ttf",
      "Poppins",
      "normal"
    );
  } catch (error) {
    console.error(
      "Could not load Poppins font:",
      error
    );
  }

  // ============================================================
  // LOAD BRILLIANT SIGNATURE FONT
  // ============================================================
  let brilliantLoaded = false;

  try {
    const brilliantBase64 = await loadFileAsBase64(
      "/Brilliant.ttf"
    );

    doc.addFileToVFS(
      "Brilliant.ttf",
      brilliantBase64
    );

    doc.addFont(
      "Brilliant.ttf",
      "Brilliant",
      "normal"
    );

    brilliantLoaded = true;
  } catch (error) {
    console.error(
      "Could not load Brilliant font:",
      error
    );
  }

  // ============================================================
  // TOP BORDER
  // ============================================================
  doc.setFillColor(...BROWN);

  doc.rect(
    0,
    0,
    pageWidth,
    10,
    "F"
  );

  // ============================================================
  // LOGO
  // ============================================================
  try {
    const logoData = await loadImageAsDataURL(
      "/eatone-logo.png"
    );

    doc.addImage(
      logoData,
      "PNG",
      14,
      13,
      85,
      38
    );
  } catch (error) {
    console.error(
      "Could not load Eat One logo:",
      error
    );

    // Fallback logo text
    doc.setFont("Poppins", "normal");
    doc.setFontSize(25);
    doc.setTextColor(...BROWN);

    doc.text(
      "Eat One",
      14,
      30
    );
  }

  // ============================================================
  // INVOICE DETAILS - TOP RIGHT
  // ============================================================
  doc.setFont(
    "Poppins",
    "normal"
  );

  doc.setFontSize(9);
  doc.setTextColor(...BROWN);

  const dateStr =
    new Date().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  doc.text(
    dateStr,
    196,
    20,
    {
      align: "right",
    }
  );

  doc.text(
    `Invoice No. ${invoiceNo || "-"}`,
    196,
    27,
    {
      align: "right",
    }
  );

  doc.text(
    `Order ID: ${orderId || "-"}`,
    196,
    34,
    {
      align: "right",
    }
  );

  doc.text(
    `Status: ${status || "-"}`,
    196,
    41,
    {
      align: "right",
    }
  );

  // ============================================================
  // FIRST DIVIDER
  // ============================================================
  let y = 48;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.5);

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 10;

  // ============================================================
  // BILLED TO
  // ============================================================
  doc.setFont(
    "Poppins",
    "normal"
  );

  doc.setFontSize(11);
  doc.setTextColor(...BROWN);

  doc.text(
    "Billed to:",
    14,
    y
  );

  y += 7;

  doc.setFontSize(9.5);

  doc.text(
    safeCustomer.name || "-",
    14,
    y
  );

  y += 6;

  const address =
    safeCustomer.line ||
    safeCustomer.address ||
    "-";

  const billedAddrLines =
    doc.splitTextToSize(
      address,
      180
    );

  doc.text(
    billedAddrLines,
    14,
    y
  );

  y +=
    Math.max(
      1,
      billedAddrLines.length
    ) * 6;

  doc.text(
    `Pincode: ${
      safeCustomer.pincode || "-"
    }`,
    14,
    y
  );

  y += 6;

  const customerPhone =
    safeCustomer.phone || "-";

  doc.text(
    customerPhone === "-"
      ? "-"
      : `+91 ${customerPhone}`,
    14,
    y
  );

  y += 9;

  doc.setLineWidth(0.3);

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 14;

  // ============================================================
  // TABLE HEADER
  // ============================================================
  doc.setFont(
    "Poppins",
    "normal"
  );

  doc.setFontSize(10);
  doc.setTextColor(...BROWN);

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

  y += 4;

  doc.setLineWidth(0.3);

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 8;

  // ============================================================
  // TABLE ITEMS
  // ============================================================
  doc.setFont(
    "Poppins",
    "normal"
  );

  doc.setFontSize(9);

  safeItems.forEach((row) => {
    const description =
      row?.description || "-";

    const descLines =
      doc.splitTextToSize(
        description,
        68
      );

    doc.text(
      descLines,
      14,
      y
    );

    doc.text(
      row?.category || "-",
      90,
      y
    );

    doc.text(
      String(
        row?.quantity || "-"
      ),
      135,
      y
    );

    const amount =
      row?.amount !== null &&
      row?.amount !== undefined
        ? `Rs. ${row.amount}`
        : "TBC";

    doc.text(
      amount,
      190,
      y,
      {
        align: "right",
      }
    );

    y += Math.max(
      8,
      6 * descLines.length
    );
  });

  y += 2;

  doc.setLineWidth(0.4);

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 9;

  // ============================================================
  // TOTAL
  // ============================================================
  doc.setFont(
    "Poppins",
    "normal"
  );

  doc.setFontSize(12);
  doc.setTextColor(...BROWN);

  doc.text(
    "Total",
    14,
    y
  );

  doc.text(
    `Rs. ${safeTotal}`,
    190,
    y,
    {
      align: "right",
    }
  );

  y += 9;

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 14;

  // ============================================================
  // SHIPPING DETAILS
  // ============================================================
  if (
    deliveryPartner ||
    trackingId
  ) {
    doc.setFont(
      "Poppins",
      "normal"
    );

    doc.setFontSize(10);

    doc.text(
      "Shipping Details",
      14,
      y
    );

    y += 7;

    doc.setFontSize(9);

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

    y += 5;
  }

  // ============================================================
  // TAGLINE
  // ============================================================
  y = Math.max(
    y + 12,
    190
  );

  doc.setFont(
    "Poppins",
    "normal"
  );

  doc.setFontSize(12);
  doc.setTextColor(...BROWN);

  doc.text(
    BRAND_TAGLINE,
    pageWidth / 2,
    y,
    {
      align: "center",
    }
  );

  y += 12;

  doc.setLineWidth(0.3);

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 14;

  // ============================================================
  // ISSUED BY
  // ============================================================
  doc.setFont(
    "Poppins",
    "normal"
  );

  doc.setFontSize(10);
  doc.setTextColor(...BROWN);

  doc.text(
    "Issued By",
    14,
    y
  );

  y += 7;

  doc.setFontSize(9.5);

  doc.text(
    founderName || "-",
    14,
    y
  );

  // ============================================================
  // FOUNDER SIGNATURE
  // ============================================================
  if (brilliantLoaded) {
    doc.setFont(
      "Brilliant",
      "normal"
    );

    doc.setFontSize(25);

    doc.text(
      founderName || "",
      196,
      y - 3,
      {
        align: "right",
      }
    );
  } else {
    // Fallback if Brilliant font fails
    doc.setFont(
      "Poppins",
      "normal"
    );

    doc.setFontSize(12);

    doc.text(
      founderName || "",
      196,
      y - 3,
      {
        align: "right",
      }
    );
  }

  y += 4;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.3);

  doc.line(
    142,
    y,
    196,
    y
  );

  y += 7;

  // ============================================================
  // FOUNDER LABEL
  // ============================================================
  doc.setFont(
    "Poppins",
    "normal"
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

  // ============================================================
  // BOTTOM BORDER
  // ============================================================
  doc.setFillColor(...GREEN);

  doc.rect(
    0,
    pageHeight - 10,
    pageWidth,
    10,
    "F"
  );

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================
  const filename =
    `EatOne-Invoice-${
      invoiceNo || "Invoice"
    }.pdf`;

  doc.save(filename);

  return true;
}
