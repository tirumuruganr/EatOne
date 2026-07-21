import jsPDF from "jspdf";

const BROWN = [42, 32, 22];
const GREEN = [63, 109, 62];

const BRAND_TAGLINE = "Healthy Delight Everyday";

// ============================================================
// LOAD LOGO
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
// FORMAT RUPEE
// ============================================================

function formatRupee(value) {
  const amount = Number(value || 0);

  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

// ============================================================
// GENERATE INVOICE PDF
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

  const safeCustomer = customer || {};

  const safeItems = Array.isArray(items)
    ? items
    : [];

  const safeTotal = Number(total || 0);

  // ============================================================
  // TOP BROWN BORDER
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
    const logoData =
      await loadImageAsDataURL(
        "/eatone-logo.png"
      );

    doc.addImage(
      logoData,
      "PNG",
      14,
      14,
      85,
      36
    );
  } catch (error) {
    console.error(
      "Logo loading failed:",
      error
    );

    // Logo fallback
    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(28);

    doc.setTextColor(
      ...BROWN
    );

    doc.text(
      "EAT ONE",
      14,
      30
    );

    doc.setFontSize(10);

    doc.text(
      BRAND_TAGLINE,
      14,
      38
    );
  }

  // ============================================================
  // DATE
  // ============================================================

  const dateStr =
    new Date().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  // ============================================================
  // TOP RIGHT DETAILS
  // ============================================================

  doc.setTextColor(
    ...BROWN
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(11);

  doc.text(
    dateStr,
    196,
    22,
    {
      align: "right",
    }
  );

  doc.text(
    `Invoice No. ${invoiceNo || "-"}`,
    196,
    29,
    {
      align: "right",
    }
  );

  doc.text(
    `Status: ${status || "Paid"}`,
    196,
    36,
    {
      align: "right",
    }
  );

  // ============================================================
  // FIRST DIVIDER
  // ============================================================

  let y = 55;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(0.4);

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
    "helvetica",
    "bold"
  );

  doc.setFontSize(14);

  doc.text(
    "Billed to:",
    14,
    y
  );

  y += 9;

  // Customer name

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(11);

  doc.text(
    safeCustomer.name || "-",
    14,
    y
  );

  y += 7;

  // ============================================================
  // ADDRESS
  // ============================================================

  const address =
    safeCustomer.line ||
    safeCustomer.address ||
    "-";

  let fullAddress = address;

  // Add pincode if it is not already part of address

  if (
    safeCustomer.pincode &&
    !String(address).includes(
      String(
        safeCustomer.pincode
      )
    )
  ) {
    fullAddress =
      `${address} - ${safeCustomer.pincode}`;
  }

  const addressLines =
    doc.splitTextToSize(
      fullAddress,
      180
    );

  doc.text(
    addressLines,
    14,
    y
  );

  y +=
    Math.max(
      1,
      addressLines.length
    ) * 6;

  // ============================================================
  // PHONE
  // ============================================================

  let customerPhone =
    safeCustomer.phone || "-";

  if (
    customerPhone !== "-" &&
    !String(customerPhone)
      .startsWith("+")
  ) {
    customerPhone =
      `+91 ${customerPhone}`;
  }

  doc.text(
    customerPhone,
    14,
    y
  );

  y += 9;

  // Divider

  doc.setLineWidth(0.3);

  doc.line(
    14,
    y,
    196,
    y
  );

  // ============================================================
  // SPACE BEFORE TABLE
  // ============================================================

  y += 22;

  // ============================================================
  // TABLE HEADER
  // ============================================================

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(11);

  doc.text(
    "Description",
    14,
    y
  );

  doc.text(
    "Category",
    88,
    y
  );

  doc.text(
    "Quantity",
    133,
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

  y += 5;

  doc.setLineWidth(0.3);

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 9;

  // ============================================================
  // PRODUCT / SHIPPING ROWS
  // ============================================================

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  safeItems.forEach(
    (row) => {

      const description =
        row?.description || "-";

      const category =
        row?.category || "-";

      const quantity =
        String(
          row?.quantity || "-"
        );

      const descriptionLines =
        doc.splitTextToSize(
          description,
          65
        );

      const categoryLines =
        doc.splitTextToSize(
          category,
          38
        );

      const quantityLines =
        doc.splitTextToSize(
          quantity,
          38
        );

      // Description

      doc.text(
        descriptionLines,
        14,
        y
      );

      // Category

      doc.text(
        categoryLines,
        88,
        y
      );

      // Quantity

      doc.text(
        quantityLines,
        133,
        y
      );

      // Amount

      let amountText = "TBC";

      if (
        row?.amount !== null &&
        row?.amount !== undefined
      ) {
        amountText =
          formatRupee(
            row.amount
          );
      }

      doc.text(
        amountText,
        190,
        y,
        {
          align: "right",
        }
      );

      // Calculate row height

      const rowHeight =
        Math.max(
          descriptionLines.length,
          categoryLines.length,
          quantityLines.length,
          1
        ) * 6;

      y += Math.max(
        rowHeight + 4,
        12
      );

      // Row line

      doc.setDrawColor(
        180,
        180,
        180
      );

      doc.setLineWidth(0.2);

      doc.line(
        14,
        y - 3,
        196,
        y - 3
      );

      doc.setDrawColor(
        ...BROWN
      );
    }
  );

  // ============================================================
  // TOTAL
  // ============================================================

  y += 4;

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
    formatRupee(
      safeTotal
    ),
    190,
    y,
    {
      align: "right",
    }
  );

  y += 8;

  doc.setLineWidth(0.4);

  doc.line(
    14,
    y,
    196,
    y
  );

  // ============================================================
  // SHIPPING/TRACKING DETAILS
  // ============================================================

  if (
    deliveryPartner ||
    trackingId
  ) {

    y += 12;

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

    y += 7;

    doc.setFont(
      "helvetica",
      "normal"
    );

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
  }

  // ============================================================
  // TAGLINE
  // ============================================================

  y = Math.max(
    y + 25,
    205
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(13);

  doc.text(
    BRAND_TAGLINE,
    pageWidth / 2,
    y,
    {
      align: "center",
    }
  );

  // ============================================================
  // DIVIDER
  // ============================================================

  y += 12;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(0.3);

  doc.line(
    14,
    y,
    196,
    y
  );

  // ============================================================
  // ISSUED BY
  // ============================================================

  y += 14;

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(11);

  doc.text(
    "Issued By",
    14,
    y
  );

  y += 8;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(11);

  doc.text(
    founderName ||
      "Manisha D Shetty",
    14,
    y
  );

  // ============================================================
  // FOUNDER SIGNATURE TEXT
  // ============================================================

  doc.setFont(
    "helvetica",
    "oblique"
  );

  doc.setFontSize(13);

  doc.text(
    founderName ||
      "Manisha D Shetty",
    190,
    y - 4,
    {
      align: "right",
    }
  );

  // Signature line

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(0.3);

  doc.line(
    145,
    y + 2,
    196,
    y + 2
  );

  // Founder label

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10);

  doc.text(
    "Founder",
    196,
    y + 10,
    {
      align: "right",
    }
  );

  // ============================================================
  // BOTTOM GREEN BORDER
  // ============================================================

  doc.setFillColor(
    ...GREEN
  );

  doc.rect(
    0,
    pageHeight - 10,
    pageWidth,
    10,
    "F"
  );

  // ============================================================
  // SAVE PDF
  // ============================================================

  const filename =
    `EatOne-Invoice-${
      invoiceNo ||
      "Invoice"
    }.pdf`;

  doc.save(filename);

  return true;
}
