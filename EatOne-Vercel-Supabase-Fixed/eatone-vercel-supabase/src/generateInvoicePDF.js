import jsPDF from "jspdf";

// ============================================================
// EAT ONE - INVOICE PDF GENERATOR
// ============================================================

// ============================================================
// BRAND
// ============================================================

const BROWN = [42, 32, 22];
const GREEN = [63, 109, 62];

const BRAND_TAGLINE = "Healthy Delight Everyday";
const FSSAI_NUMBER = "21226008002884";

// ============================================================
// LOAD FILE AS BASE64
// ============================================================

async function loadFileAsBase64(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not load file: ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let binary = "";

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

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
// MONEY FORMAT
// ============================================================

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

// ============================================================
// DATE FORMAT
// ============================================================

function formatInvoiceDate() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
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
  // ==========================================================
  // CREATE PDF
  // ==========================================================

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ==========================================================
  // PAGE DIMENSIONS
  // ==========================================================

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;

  // ==========================================================
  // COMMON LEFT / RIGHT ALIGNMENT
  // ==========================================================

  const LINE_LEFT = 14;
  const LINE_RIGHT = 196;

  // ==========================================================
  // TABLE COLUMNS
  // ==========================================================

  const DESCRIPTION_X = 14;
  const CATEGORY_X = 88;
  const QUANTITY_X = 132;
  const AMOUNT_X = 190;

  // ==========================================================
  // CONSTANT SPACING
  // ==========================================================

  const TABLE_HEADER_TOP_GAP = 16;
  const TABLE_HEADER_BOTTOM_GAP = 7;

  const TABLE_FIRST_ROW_GAP = 11;

  const TABLE_ROW_HEIGHT = 13;

  const TOTAL_TOP_GAP = 12;
  const TOTAL_BOTTOM_GAP = 12;

  const TAGLINE_TOP_GAP = 18;
  const TAGLINE_BOTTOM_GAP = 14;

  // ==========================================================
  // FIXED FOOTER
  // ==========================================================

  // Footer divider line
  const FOOTER_LINE_Y = 241;

  // Issued By starts here
  const FOOTER_Y = 253;

  // Bottom green bar
  const BOTTOM_BAR_Y = PAGE_HEIGHT - 10;

  // ==========================================================
  // CONTENT LIMIT
  //
  // Products must stop before this position.
  // This reserves room for Total + Tagline + Footer.
  // ==========================================================

  const ITEM_PAGE_LIMIT = 220;

  // ==========================================================
  // SAFE DATA
  // ==========================================================

  const safeCustomer = customer || {};

  const safeItems = Array.isArray(items)
    ? items
    : [];

  const safeTotal = Number(total || 0);

  const safeFounderName =
    founderName || "Manisha D Shetty";

  // ==========================================================
  // FONT STATUS
  // ==========================================================

  let leagueSpartanLoaded = false;
  let poppinsMediumLoaded = false;
  let poppinsExtraBoldLoaded = false;
  let podkovaLoaded = false;
  let brilliantLoaded = false;

  // ==========================================================
  // LEAGUE SPARTAN BOLD
  // ==========================================================

  try {
    const font =
      await loadFileAsBase64(
        "/league-spartan-bold.ttf"
      );

    doc.addFileToVFS(
      "league-spartan-bold.ttf",
      font
    );

    doc.addFont(
      "league-spartan-bold.ttf",
      "LeagueSpartan",
      "bold"
    );

    doc.setFont(
      "LeagueSpartan",
      "bold"
    );

    doc.getTextWidth(
      "League Spartan Test"
    );

    leagueSpartanLoaded = true;
  } catch (error) {
    console.error(
      "League Spartan failed:",
      error
    );
  }

  // ==========================================================
  // POPPINS MEDIUM
  // ==========================================================

  try {
    const font =
      await loadFileAsBase64(
        "/Poppins-Medium.ttf"
      );

    doc.addFileToVFS(
      "Poppins-Medium.ttf",
      font
    );

    doc.addFont(
      "Poppins-Medium.ttf",
      "PoppinsMedium",
      "normal"
    );

    doc.setFont(
      "PoppinsMedium",
      "normal"
    );

    doc.getTextWidth(
      "Poppins Medium Test"
    );

    poppinsMediumLoaded = true;
  } catch (error) {
    console.error(
      "Poppins Medium failed:",
      error
    );
  }

  // ==========================================================
  // POPPINS EXTRA BOLD
  // ==========================================================

  try {
    const font =
      await loadFileAsBase64(
        "/Poppins-ExtraBold.ttf"
      );

    doc.addFileToVFS(
      "Poppins-ExtraBold.ttf",
      font
    );

    doc.addFont(
      "Poppins-ExtraBold.ttf",
      "PoppinsExtraBold",
      "bold"
    );

    doc.setFont(
      "PoppinsExtraBold",
      "bold"
    );

    doc.getTextWidth(
      "Poppins ExtraBold Test"
    );

    poppinsExtraBoldLoaded = true;
  } catch (error) {
    console.error(
      "Poppins ExtraBold failed:",
      error
    );
  }

  // ==========================================================
  // PODKOVA BOLD
  // ==========================================================

  try {
    const font =
      await loadFileAsBase64(
        "/Podkova-Bold.ttf"
      );

    doc.addFileToVFS(
      "Podkova-Bold.ttf",
      font
    );

    doc.addFont(
      "Podkova-Bold.ttf",
      "Podkova",
      "bold"
    );

    doc.setFont(
      "Podkova",
      "bold"
    );

    doc.getTextWidth(
      "Podkova Test"
    );

    podkovaLoaded = true;
  } catch (error) {
    console.error(
      "Podkova failed:",
      error
    );
  }

  // ==========================================================
  // BRILLIANT SIGNATURE FONT
  // ==========================================================

  try {
    const font =
      await loadFileAsBase64(
        "/Brilliant.ttf"
      );

    doc.addFileToVFS(
      "Brilliant.ttf",
      font
    );

    doc.addFont(
      "Brilliant.ttf",
      "Brilliant",
      "normal"
    );

    doc.setFont(
      "Brilliant",
      "normal"
    );

    doc.getTextWidth(
      safeFounderName
    );

    brilliantLoaded = true;
  } catch (error) {
    console.error(
      "Brilliant failed:",
      error
    );
  }

  // ==========================================================
  // FONT HELPERS
  // ==========================================================

  const leagueSpartanFont = () => {
    if (leagueSpartanLoaded) {
      doc.setFont(
        "LeagueSpartan",
        "bold"
      );
    } else {
      doc.setFont(
        "helvetica",
        "bold"
      );
    }
  };

  const poppinsMediumFont = () => {
    if (poppinsMediumLoaded) {
      doc.setFont(
        "PoppinsMedium",
        "normal"
      );
    } else {
      doc.setFont(
        "helvetica",
        "normal"
      );
    }
  };

  const poppinsBoldFont = () => {
    if (poppinsExtraBoldLoaded) {
      doc.setFont(
        "PoppinsExtraBold",
        "bold"
      );
    } else {
      doc.setFont(
        "helvetica",
        "bold"
      );
    }
  };

  const podkovaFont = () => {
    if (podkovaLoaded) {
      doc.setFont(
        "Podkova",
        "bold"
      );
    } else {
      doc.setFont(
        "helvetica",
        "bold"
      );
    }
  };

  // ==========================================================
  // DRAW TOP BAR
  // ==========================================================

  const drawTopBar = () => {
    doc.setFillColor(...BROWN);

    doc.rect(
      0,
      0,
      PAGE_WIDTH,
      10,
      "F"
    );
  };

  // ==========================================================
  // DRAW BOTTOM BAR
  // ==========================================================

  const drawBottomBar = () => {
    doc.setFillColor(...GREEN);

    doc.rect(
      0,
      BOTTOM_BAR_Y,
      PAGE_WIDTH,
      10,
      "F"
    );
  };

  // ==========================================================
  // DRAW TABLE HEADER
  // ==========================================================

  const drawTableHeader = (startY) => {
    let headerY = startY;

    // --------------------------------------------------------
    // Fixed gap above heading
    // --------------------------------------------------------

    headerY += TABLE_HEADER_TOP_GAP;

    // --------------------------------------------------------
    // Heading
    // --------------------------------------------------------

    poppinsBoldFont();

    doc.setFontSize(10);
    doc.setTextColor(...BROWN);

    doc.text(
      "Description",
      DESCRIPTION_X,
      headerY
    );

    doc.text(
      "Category",
      CATEGORY_X,
      headerY
    );

    doc.text(
      "Quantity",
      QUANTITY_X,
      headerY
    );

    doc.text(
      "Amount",
      AMOUNT_X,
      headerY,
      {
        align: "right",
      }
    );

    // --------------------------------------------------------
    // Fixed gap below heading
    // --------------------------------------------------------

    headerY += TABLE_HEADER_BOTTOM_GAP;

    // --------------------------------------------------------
    // Header bottom line
    // --------------------------------------------------------

    doc.setDrawColor(...BROWN);
    doc.setLineWidth(0.35);

    doc.line(
      LINE_LEFT,
      headerY,
      LINE_RIGHT,
      headerY
    );

    // --------------------------------------------------------
    // Fixed gap to first row
    // --------------------------------------------------------

    headerY += TABLE_FIRST_ROW_GAP;

    return headerY;
  };

  // ==========================================================
  // NEW ITEM PAGE
  // ==========================================================

  const createNewItemPage = () => {
    doc.addPage();

    drawTopBar();
    drawBottomBar();

    // --------------------------------------------------------
    // Continued invoice heading
    // --------------------------------------------------------

    leagueSpartanFont();

    doc.setFontSize(11);
    doc.setTextColor(...BROWN);

    doc.text(
      `Invoice No. ${invoiceNo || "-"}`,
      LINE_LEFT,
      24
    );

    doc.text(
      "Continued",
      LINE_RIGHT,
      24,
      {
        align: "right",
      }
    );

    // --------------------------------------------------------
    // Divider
    // --------------------------------------------------------

    doc.setDrawColor(...BROWN);
    doc.setLineWidth(0.35);

    doc.line(
      LINE_LEFT,
      32,
      LINE_RIGHT,
      32
    );

    // --------------------------------------------------------
    // Repeat table heading
    // --------------------------------------------------------

    return drawTableHeader(32);
  };

  // ==========================================================
  // FIRST PAGE TOP BAR
  // ==========================================================

  drawTopBar();

  // ==========================================================
  // FIRST PAGE BOTTOM BAR
  // ==========================================================

  drawBottomBar();

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
      "Logo failed:",
      error
    );

    leagueSpartanFont();

    doc.setFontSize(26);
    doc.setTextColor(...BROWN);

    doc.text(
      "EAT ONE",
      LINE_LEFT,
      30
    );
  }

  // ==========================================================
  // DATE
  // ==========================================================

  leagueSpartanFont();

  doc.setFontSize(12);
  doc.setTextColor(...BROWN);

  doc.text(
    formatInvoiceDate(),
    LINE_RIGHT,
    20,
    {
      align: "right",
    }
  );

  // ==========================================================
  // INVOICE NUMBER
  // ==========================================================

  leagueSpartanFont();

  doc.setFontSize(11);

  doc.text(
    `Invoice No. ${invoiceNo || "-"}`,
    LINE_RIGHT,
    28,
    {
      align: "right",
    }
  );

  // ==========================================================
  // STATUS
  // ==========================================================

  let displayStatus =
    status || "Paid";

  if (
    String(displayStatus)
      .toLowerCase() === "paid"
  ) {
    displayStatus = "Paid";
  }

  leagueSpartanFont();

  doc.setFontSize(11);

  doc.text(
    `Status: ${displayStatus}`,
    LINE_RIGHT,
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
  doc.setLineWidth(0.35);

  doc.line(
    LINE_LEFT,
    y,
    LINE_RIGHT,
    y
  );

  // ==========================================================
  // BILLED TO
  // ==========================================================

  y += 11;

  leagueSpartanFont();

  doc.setFontSize(12);
  doc.setTextColor(...BROWN);

  doc.text(
    "Billed to:",
    LINE_LEFT,
    y
  );

  // ==========================================================
  // CUSTOMER NAME
  // ==========================================================

  y += 8;

  poppinsMediumFont();

  doc.setFontSize(10.5);

  doc.text(
    String(
      safeCustomer.name || "-"
    ),
    LINE_LEFT,
    y
  );

  // ==========================================================
  // CUSTOMER ADDRESS
  // ==========================================================

  y += 7;

  const customerAddress =
    safeCustomer.line ||
    safeCustomer.address ||
    "-";

  let fullAddress =
    String(customerAddress);

  if (
    safeCustomer.pincode &&
    !String(customerAddress).includes(
      String(safeCustomer.pincode)
    )
  ) {
    fullAddress =
      `${customerAddress} - ${safeCustomer.pincode}`;
  }

  const addressLines =
    doc.splitTextToSize(
      fullAddress,
      175
    );

  poppinsMediumFont();

  doc.text(
    addressLines,
    LINE_LEFT,
    y
  );

  y +=
    Math.max(
      addressLines.length,
      1
    ) * 6;

  // ==========================================================
  // PHONE
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

  poppinsMediumFont();

  doc.text(
    String(customerPhone),
    LINE_LEFT,
    y
  );

  // ==========================================================
  // ORDER ID
  // ==========================================================

  if (orderId) {
    y += 6;

    poppinsMediumFont();

    doc.text(
      `Order ID: ${orderId}`,
      LINE_LEFT,
      y
    );
  }

  // ==========================================================
  // CUSTOMER BOTTOM LINE
  // ==========================================================

  y += 10;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.35);

  doc.line(
    LINE_LEFT,
    y,
    LINE_RIGHT,
    y
  );

  // ==========================================================
  // TABLE HEADER
  // ==========================================================

  y = drawTableHeader(y);

  // ==========================================================
  // PRODUCT ROWS
  // ==========================================================

  for (
    let index = 0;
    index < safeItems.length;
    index++
  ) {
    const row =
      safeItems[index] || {};

    const description =
      row.description || "-";

    const category =
      row.category || "-";

    const quantity =
      String(
        row.quantity || "-"
      );

    const amount =
      row.amount !== undefined &&
      row.amount !== null
        ? `Rs. ${formatMoney(row.amount)}`
        : "-";

    // ========================================================
    // WRAP TEXT
    // ========================================================

    poppinsMediumFont();

    doc.setFontSize(9.5);

    const descriptionLines =
      doc.splitTextToSize(
        String(description),
        65
      );

    const categoryLines =
      doc.splitTextToSize(
        String(category),
        36
      );

    const quantityLines =
      doc.splitTextToSize(
        String(quantity),
        34
      );

    const maximumLines =
      Math.max(
        descriptionLines.length,
        categoryLines.length,
        quantityLines.length,
        1
      );

    // ========================================================
    // CALCULATE ACTUAL ROW HEIGHT
    // ========================================================

    const calculatedRowHeight =
      Math.max(
        TABLE_ROW_HEIGHT,
        maximumLines * 5 + 6
      );

    // ========================================================
    // PAGE BREAK CHECK
    // ========================================================

    if (
      y + calculatedRowHeight >
      ITEM_PAGE_LIMIT
    ) {
      // ------------------------------------------------------
      // Close current table
      // ------------------------------------------------------

      doc.setDrawColor(...BROWN);
      doc.setLineWidth(0.35);

      doc.line(
        LINE_LEFT,
        y - 5,
        LINE_RIGHT,
        y - 5
      );

      // ------------------------------------------------------
      // New page + repeated heading
      // ------------------------------------------------------

      y = createNewItemPage();
    }

    // ========================================================
    // DRAW ROW
    // ========================================================

    poppinsMediumFont();

    doc.setFontSize(9.5);
    doc.setTextColor(...BROWN);

    doc.text(
      descriptionLines,
      DESCRIPTION_X,
      y
    );

    doc.text(
      categoryLines,
      CATEGORY_X,
      y
    );

    doc.text(
      quantityLines,
      QUANTITY_X,
      y
    );

    doc.text(
      amount,
      AMOUNT_X,
      y,
      {
        align: "right",
      }
    );

    // ========================================================
    // MOVE TO NEXT ROW
    // ========================================================

    y += calculatedRowHeight;

    // ========================================================
    // ROW DIVIDER
    // ========================================================

    if (
      index <
      safeItems.length - 1
    ) {
      doc.setDrawColor(
        220,
        220,
        220
      );

      doc.setLineWidth(0.15);

      doc.line(
        LINE_LEFT,
        y - 5,
        LINE_RIGHT,
        y - 5
      );
    }
  }

  // ==========================================================
  // SPACE NEEDED AFTER PRODUCTS
  //
  // We need enough room for:
  // table bottom
  // total
  // tagline
  // footer
  // ==========================================================

  const REQUIRED_FINAL_SPACE = 85;

  // ==========================================================
  // IF FINAL SECTIONS DO NOT FIT, CREATE LAST PAGE
  // ==========================================================

  if (
    y + REQUIRED_FINAL_SPACE >
    FOOTER_LINE_Y
  ) {
    doc.addPage();

    drawTopBar();
    drawBottomBar();

    // --------------------------------------------------------
    // Invoice reference on final page
    // --------------------------------------------------------

    leagueSpartanFont();

    doc.setFontSize(11);
    doc.setTextColor(...BROWN);

    doc.text(
      `Invoice No. ${invoiceNo || "-"}`,
      LINE_LEFT,
      24
    );

    doc.text(
      "Invoice Summary",
      LINE_RIGHT,
      24,
      {
        align: "right",
      }
    );

    doc.setDrawColor(...BROWN);
    doc.setLineWidth(0.35);

    doc.line(
      LINE_LEFT,
      32,
      LINE_RIGHT,
      32
    );

    y = 45;
  }

  // ==========================================================
  // TABLE BOTTOM LINE
  // ==========================================================

  y += 3;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.35);

  doc.line(
    LINE_LEFT,
    y,
    LINE_RIGHT,
    y
  );

  // ==========================================================
  // TOTAL
  // ==========================================================

  y += TOTAL_TOP_GAP;

  poppinsBoldFont();

  doc.setFontSize(11);
  doc.setTextColor(...BROWN);

  doc.text(
    "Total",
    DESCRIPTION_X,
    y
  );

  doc.text(
    `Rs. ${formatMoney(safeTotal)}`,
    AMOUNT_X,
    y,
    {
      align: "right",
    }
  );

  // ==========================================================
  // TOTAL BOTTOM LINE
  // ==========================================================

  y += TOTAL_BOTTOM_GAP;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.35);

  doc.line(
    LINE_LEFT,
    y,
    LINE_RIGHT,
    y
  );

  // ==========================================================
  // SHIPPING DETAILS - OPTIONAL
  // ==========================================================

  if (
    deliveryPartner ||
    trackingId
  ) {
    y += 10;

    poppinsBoldFont();

    doc.setFontSize(9.5);

    doc.text(
      "Shipping Details",
      LINE_LEFT,
      y
    );

    y += 6;

    poppinsMediumFont();

    doc.setFontSize(8.5);

    if (deliveryPartner) {
      doc.text(
        `Delivery Partner: ${deliveryPartner}`,
        LINE_LEFT,
        y
      );

      y += 5;
    }

    if (trackingId) {
      doc.text(
        `Tracking ID: ${trackingId}`,
        LINE_LEFT,
        y
      );

      y += 5;
    }
  }

  // ==========================================================
  // HEALTHY DELIGHT EVERYDAY
  //
  // CONSTANT SPACING
  // ==========================================================

  y += TAGLINE_TOP_GAP;

  podkovaFont();

  doc.setFontSize(13);
  doc.setTextColor(...BROWN);

  doc.text(
    BRAND_TAGLINE,
    PAGE_WIDTH / 2,
    y,
    {
      align: "center",
    }
  );

  // ==========================================================
  // LINE BELOW TAGLINE
  // ==========================================================

  y += TAGLINE_BOTTOM_GAP;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.35);

  doc.line(
    LINE_LEFT,
    y,
    LINE_RIGHT,
    y
  );

  // ==========================================================
  // FOOTER SAFETY
  //
  // If for any unexpected reason the summary reaches the
  // fixed footer, create one final page.
  // ==========================================================

  if (
    y >
    FOOTER_LINE_Y - 8
  ) {
    doc.addPage();

    drawTopBar();
    drawBottomBar();

    leagueSpartanFont();

    doc.setFontSize(11);
    doc.setTextColor(...BROWN);

    doc.text(
      `Invoice No. ${invoiceNo || "-"}`,
      LINE_LEFT,
      24
    );

    doc.setDrawColor(...BROWN);
    doc.setLineWidth(0.35);

    doc.line(
      LINE_LEFT,
      32,
      LINE_RIGHT,
      32
    );
  }

  // ==========================================================
  // FIXED FOOTER DIVIDER
  //
  // IMPORTANT:
  // This is always at exactly the same Y position.
  // ==========================================================

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.35);

  doc.line(
    LINE_LEFT,
    FOOTER_LINE_Y,
    LINE_RIGHT,
    FOOTER_LINE_Y
  );

  // ==========================================================
  // ISSUED BY
  //
  // FIXED BOTTOM LEFT
  // POPPINS EXTRA BOLD
  // ==========================================================

  poppinsBoldFont();

  doc.setFontSize(11);
  doc.setTextColor(...BROWN);

  doc.text(
    "Issued By",
    LINE_LEFT,
    FOOTER_Y
  );

  // ==========================================================
  // FOUNDER NAME
  //
  // FIXED BOTTOM LEFT
  // POPPINS EXTRA BOLD
  // ==========================================================

  poppinsBoldFont();

  doc.setFontSize(10.5);

  doc.text(
    safeFounderName,
    LINE_LEFT,
    FOOTER_Y + 8
  );

  // ==========================================================
  // FSSAI
  //
  // FIXED BOTTOM LEFT
  // POPPINS MEDIUM
  // ==========================================================

  poppinsMediumFont();

  doc.setFontSize(8.5);

  doc.text(
    `FSSAI License No: ${FSSAI_NUMBER}`,
    LINE_LEFT,
    FOOTER_Y + 15
  );

  // ==========================================================
  // SIGNATURE
  //
  // FIXED BOTTOM RIGHT
  // BRILLIANT
  // ==========================================================

  const SIGNATURE_Y =
    FOOTER_Y + 1;

  if (brilliantLoaded) {
    doc.setFont(
      "Brilliant",
      "normal"
    );

    doc.setFontSize(20);
  } else {
    doc.setFont(
      "helvetica",
      "oblique"
    );

    doc.setFontSize(14);
  }

  doc.setTextColor(...BROWN);

  doc.text(
    safeFounderName,
    LINE_RIGHT,
    SIGNATURE_Y,
    {
      align: "right",
    }
  );

  // ==========================================================
  // SIGNATURE LINE
  //
  // FIXED POSITION
  // ==========================================================

  const SIGNATURE_LINE_Y =
    FOOTER_Y + 10;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.3);

  doc.line(
    142,
    SIGNATURE_LINE_Y,
    LINE_RIGHT,
    SIGNATURE_LINE_Y
  );

  // ==========================================================
  // FOUNDER
  //
  // FIXED BOTTOM RIGHT
  // POPPINS EXTRA BOLD
  // ==========================================================

  poppinsBoldFont();

  doc.setFontSize(9.5);
  doc.setTextColor(...BROWN);

  doc.text(
    "Founder",
    LINE_RIGHT,
    SIGNATURE_LINE_Y + 8,
    {
      align: "right",
    }
  );

  // ==========================================================
  // ENSURE BOTTOM BAR EXISTS ON LAST PAGE
  // ==========================================================

  drawBottomBar();

  // ==========================================================
  // SAVE PDF
  // ==========================================================

  const filename =
    `EatOne-Invoice-${invoiceNo || "Invoice"}.pdf`;

  doc.save(filename);

  return true;
}
