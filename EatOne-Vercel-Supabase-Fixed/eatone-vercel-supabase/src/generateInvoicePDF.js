import jsPDF from "jspdf";

// ============================================================
// EAT ONE BRAND SETTINGS
// ============================================================

const BROWN = [42, 32, 22];
const GREEN = [63, 109, 62];

const BRAND_TAGLINE = "Healthy Delight Everyday";

const FSSAI_NUMBER = "21226008002884";

// ============================================================
// LOAD IMAGE AS DATA URL
// ============================================================

async function loadImageAsDataURL(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not load image: ${url}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}

// ============================================================
// FORMAT MONEY
// ============================================================

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatInvoiceDate() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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
  // ==========================================================
  // CREATE PDF
  // ==========================================================

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ==========================================================
  // PAGE SETTINGS
  // ==========================================================

  const pageWidth = 210;
  const pageHeight = 297;

  const leftMargin = 14;
  const rightMargin = 196;

  const safeCustomer = customer || {};

  const safeItems = Array.isArray(items)
    ? items
    : [];

  const safeTotal = Number(total || 0);

  const safeFounderName =
    founderName || "Manisha D Shetty";

  // ==========================================================
  // FONT HELPERS
  //
  // IMPORTANT:
  // We are temporarily using ONLY built-in jsPDF fonts.
  //
  // This prevents the:
  //
  // Cannot read properties of undefined (reading 'widths')
  //
  // error caused by problematic custom TTF registration.
  // ==========================================================

  const normalFont = () => {
    doc.setFont("helvetica", "normal");
  };

  const boldFont = () => {
    doc.setFont("helvetica", "bold");
  };

  const italicFont = () => {
    doc.setFont("helvetica", "oblique");
  };

  // ==========================================================
  // TOP BROWN BORDER
  // ==========================================================

  doc.setFillColor(...BROWN);

  doc.rect(
    0,
    0,
    pageWidth,
    10,
    "F"
  );

  // ==========================================================
  // LOGO
  // ==========================================================

  try {
    const logo =
      await loadImageAsDataURL(
        "/eatone-logo.png"
      );

    doc.addImage(
      logo,
      "PNG",
      14,
      14,
      82,
      34
    );
  } catch (error) {
    console.error(
      "Logo loading failed:",
      error
    );

    // --------------------------------------------------------
    // FALLBACK IF LOGO CANNOT LOAD
    // --------------------------------------------------------

    boldFont();

    doc.setFontSize(27);

    doc.setTextColor(...BROWN);

    doc.text(
      "EAT ONE",
      leftMargin,
      29
    );

    normalFont();

    doc.setFontSize(10);

    doc.text(
      BRAND_TAGLINE,
      leftMargin,
      37
    );
  }

  // ==========================================================
  // DATE / INVOICE NUMBER / STATUS
  // ==========================================================

  const invoiceDate =
    formatInvoiceDate();

  boldFont();

  doc.setTextColor(...BROWN);

  // ----------------------------------------------------------
  // DATE
  // ----------------------------------------------------------

  doc.setFontSize(12);

  doc.text(
    invoiceDate,
    rightMargin,
    20,
    {
      align: "right",
    }
  );

  // ----------------------------------------------------------
  // INVOICE NUMBER
  // ----------------------------------------------------------

  doc.setFontSize(11);

  doc.text(
    `Invoice No. ${invoiceNo || "-"}`,
    rightMargin,
    28,
    {
      align: "right",
    }
  );

  // ----------------------------------------------------------
  // STATUS
  // ----------------------------------------------------------

  doc.setFontSize(11);

  doc.text(
    `Status: ${status || "Paid"}`,
    rightMargin,
    36,
    {
      align: "right",
    }
  );

  // ==========================================================
  // FIRST DIVIDER
  // ==========================================================

  let y = 52;

  doc.setDrawColor(...BROWN);

  doc.setLineWidth(0.4);

  doc.line(
    leftMargin,
    y,
    rightMargin,
    y
  );

  // ==========================================================
  // BILLED TO
  // ==========================================================

  y += 11;

  boldFont();

  doc.setFontSize(12);

  doc.text(
    "Billed to:",
    leftMargin,
    y
  );

  // ==========================================================
  // CUSTOMER NAME
  // ==========================================================

  y += 8;

  normalFont();

  doc.setFontSize(10.5);

  doc.text(
    safeCustomer.name || "-",
    leftMargin,
    y
  );

  // ==========================================================
  // CUSTOMER ADDRESS
  // ==========================================================

  y += 7;

  const address =
    safeCustomer.line ||
    safeCustomer.address ||
    "-";

  let fullAddress = address;

  // ----------------------------------------------------------
  // ADD PINCODE IF NOT ALREADY PRESENT
  // ----------------------------------------------------------

  if (
    safeCustomer.pincode &&
    !String(address).includes(
      String(safeCustomer.pincode)
    )
  ) {
    fullAddress =
      `${address} - ${safeCustomer.pincode}`;
  }

  const addressLines =
    doc.splitTextToSize(
      fullAddress,
      175
    );

  doc.text(
    addressLines,
    leftMargin,
    y
  );

  y +=
    Math.max(
      addressLines.length,
      1
    ) * 6;

  // ==========================================================
  // CUSTOMER PHONE
  // ==========================================================

  let customerPhone =
    safeCustomer.phone || "-";

  if (
    customerPhone !== "-" &&
    !String(customerPhone).startsWith("+")
  ) {
    customerPhone =
      `+91 ${customerPhone}`;
  }

  doc.text(
    customerPhone,
    leftMargin,
    y
  );

  // ==========================================================
  // ORDER ID
  // ==========================================================

  if (orderId) {
    y += 6;

    doc.text(
      `Order ID: ${orderId}`,
      leftMargin,
      y
    );
  }

  // ==========================================================
  // CUSTOMER SECTION DIVIDER
  // ==========================================================

  y += 9;

  doc.setDrawColor(...BROWN);

  doc.setLineWidth(0.3);

  doc.line(
    leftMargin,
    y,
    rightMargin,
    y
  );

  // ==========================================================
  // TABLE
  // ==========================================================

  y += 18;

  // ==========================================================
  // TABLE COLUMN POSITIONS
  // ==========================================================

  const descriptionX = 14;
  const categoryX = 88;
  const quantityX = 132;
  const amountX = 190;

  // ==========================================================
  // TABLE HEADER
  // ==========================================================

  boldFont();

  doc.setFontSize(10);

  doc.setTextColor(...BROWN);

  doc.text(
    "Description",
    descriptionX,
    y
  );

  doc.text(
    "Category",
    categoryX,
    y
  );

  doc.text(
    "Quantity",
    quantityX,
    y
  );

  doc.text(
    "Amount",
    amountX,
    y,
    {
      align: "right",
    }
  );

  // ==========================================================
  // TABLE HEADER LINE
  // ==========================================================

  y += 5;

  doc.setDrawColor(...BROWN);

  doc.setLineWidth(0.4);

  doc.line(
    leftMargin,
    y,
    rightMargin,
    y
  );

  y += 10;

  // ==========================================================
  // TABLE ITEMS
  // ==========================================================

  normalFont();

  doc.setFontSize(9.5);

  safeItems.forEach((row) => {
    // --------------------------------------------------------
    // GET VALUES
    // --------------------------------------------------------

    const description =
      row?.description || "-";

    const category =
      row?.category || "-";

    const quantity =
      String(
        row?.quantity || "-"
      );

    const amount =
      row?.amount !== undefined &&
      row?.amount !== null
        ? `Rs. ${formatMoney(row.amount)}`
        : "-";

    // --------------------------------------------------------
    // WRAP LONG TEXT
    // --------------------------------------------------------

    const descriptionLines =
      doc.splitTextToSize(
        description,
        65
      );

    const categoryLines =
      doc.splitTextToSize(
        category,
        36
      );

    const quantityLines =
      doc.splitTextToSize(
        quantity,
        34
      );

    // --------------------------------------------------------
    // CALCULATE ROW HEIGHT
    // --------------------------------------------------------

    const maximumLines =
      Math.max(
        descriptionLines.length,
        categoryLines.length,
        quantityLines.length,
        1
      );

    const textHeight =
      maximumLines * 5;

    const rowHeight =
      Math.max(
        13,
        textHeight + 5
      );

    // --------------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------------

    doc.text(
      descriptionLines,
      descriptionX,
      y
    );

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    doc.text(
      categoryLines,
      categoryX,
      y
    );

    // --------------------------------------------------------
    // QUANTITY
    // --------------------------------------------------------

    doc.text(
      quantityLines,
      quantityX,
      y
    );

    // --------------------------------------------------------
    // AMOUNT
    // --------------------------------------------------------

    doc.text(
      amount,
      amountX,
      y,
      {
        align: "right",
      }
    );

    // --------------------------------------------------------
    // MOVE TO BOTTOM OF ROW
    // --------------------------------------------------------

    y += rowHeight;

    // --------------------------------------------------------
    // ROW DIVIDER
    // --------------------------------------------------------

    doc.setDrawColor(
      205,
      205,
      205
    );

    doc.setLineWidth(0.2);

    doc.line(
      leftMargin,
      y - 4,
      rightMargin,
      y - 4
    );
  });

  // ==========================================================
  // TOTAL SECTION
  // ==========================================================

  y += 3;

  // ----------------------------------------------------------
  // STRONG LINE BEFORE TOTAL
  // ----------------------------------------------------------

  doc.setDrawColor(...BROWN);

  doc.setLineWidth(0.4);

  doc.line(
    leftMargin,
    y,
    rightMargin,
    y
  );

  // ----------------------------------------------------------
  // TOTAL
  // ----------------------------------------------------------

  y += 11;

  boldFont();

  doc.setFontSize(11);

  doc.text(
    "Total",
    leftMargin,
    y
  );

  doc.text(
    `Rs. ${formatMoney(safeTotal)}`,
    amountX,
    y,
    {
      align: "right",
    }
  );

  // ----------------------------------------------------------
  // TOTAL BOTTOM LINE
  // ----------------------------------------------------------

  y += 8;

  doc.setDrawColor(...BROWN);

  doc.setLineWidth(0.4);

  doc.line(
    leftMargin,
    y,
    rightMargin,
    y
  );

  // ==========================================================
  // OPTIONAL SHIPPING / TRACKING INFORMATION
  // ==========================================================

  if (
    deliveryPartner ||
    trackingId
  ) {
    y += 11;

    boldFont();

    doc.setFontSize(10);

    doc.text(
      "Shipping Details",
      leftMargin,
      y
    );

    y += 7;

    normalFont();

    doc.setFontSize(9);

    // --------------------------------------------------------
    // DELIVERY PARTNER
    // --------------------------------------------------------

    if (deliveryPartner) {
      doc.text(
        `Delivery Partner: ${deliveryPartner}`,
        leftMargin,
        y
      );

      y += 6;
    }

    // --------------------------------------------------------
    // TRACKING ID
    // --------------------------------------------------------

    if (trackingId) {
      doc.text(
        `Tracking ID: ${trackingId}`,
        leftMargin,
        y
      );

      y += 6;
    }
  }

  // ==========================================================
  // TAGLINE POSITION
  // ==========================================================

  y = Math.max(
    y + 20,
    195
  );

  // Prevent footer from going too low
  if (y > 220) {
    y = 220;
  }

  // ==========================================================
  // BRAND TAGLINE
  // ==========================================================

  boldFont();

  doc.setFontSize(11);

  doc.setTextColor(...BROWN);

  doc.text(
    BRAND_TAGLINE,
    pageWidth / 2,
    y,
    {
      align: "center",
    }
  );

  // ==========================================================
  // DIVIDER BEFORE ISSUED BY
  // ==========================================================

  y += 12;

  doc.setDrawColor(...BROWN);

  doc.setLineWidth(0.3);

  doc.line(
    leftMargin,
    y,
    rightMargin,
    y
  );

  // ==========================================================
  // ISSUED BY
  // ==========================================================

  y += 13;

  boldFont();

  doc.setFontSize(11);

  doc.text(
    "Issued By",
    leftMargin,
    y
  );

  // ==========================================================
  // FOUNDER NAME - LEFT SIDE
  // ==========================================================

  y += 8;

  boldFont();

  doc.setFontSize(11);

  doc.text(
    safeFounderName,
    leftMargin,
    y
  );

  // ==========================================================
  // FSSAI LICENSE NUMBER
  // ==========================================================

  y += 7;

  normalFont();

  doc.setFontSize(9);

  doc.text(
    `FSSAI License No: ${FSSAI_NUMBER}`,
    leftMargin,
    y
  );

  // ==========================================================
  // SIGNATURE - RIGHT SIDE
  //
  // Built-in Helvetica Oblique is used temporarily.
  // Once PDF works correctly, Brilliant.ttf can be tested again.
  // ==========================================================

  const signatureY =
    y - 10;

  italicFont();

  doc.setFontSize(15);

  doc.text(
    safeFounderName,
    rightMargin,
    signatureY,
    {
      align: "right",
    }
  );

  // ==========================================================
  // SIGNATURE LINE
  // ==========================================================

  const signatureLineY =
    signatureY + 5;

  doc.setDrawColor(...BROWN);

  doc.setLineWidth(0.3);

  doc.line(
    142,
    signatureLineY,
    rightMargin,
    signatureLineY
  );

  // ==========================================================
  // FOUNDER ROLE
  // ==========================================================

  boldFont();

  doc.setFontSize(10);

  doc.text(
    "Founder",
    rightMargin,
    signatureLineY + 8,
    {
      align: "right",
    }
  );

  // ==========================================================
  // BOTTOM GREEN BORDER
  // ==========================================================

  doc.setFillColor(...GREEN);

  doc.rect(
    0,
    pageHeight - 10,
    pageWidth,
    10,
    "F"
  );

  // ==========================================================
  // SAVE PDF
  // ==========================================================

  const filename =
    `EatOne-Invoice-${
      invoiceNo || "Invoice"
    }.pdf`;

  doc.save(filename);

  return true;
}
