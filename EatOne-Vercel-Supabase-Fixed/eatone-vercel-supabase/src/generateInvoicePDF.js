import jsPDF from "jspdf";

// ============================================================
// EAT ONE - INVOICE PDF
// ============================================================

// ============================================================
// BRAND SETTINGS
// ============================================================

const BROWN = [42, 32, 22];
const GREEN = [63, 109, 62];

const BRAND_TAGLINE = "Healthy Delight Everyday";
const FSSAI_NUMBER = "21226008002884";

// ============================================================
// LOAD FONT FILE AS BASE64
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
  // PAGE SETTINGS
  // ==========================================================

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;

  // ==========================================================
  // COMMON LINE ALIGNMENT
  //
  // EVERY MAIN HORIZONTAL LINE USES THESE COORDINATES
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
  // CONSTANT TABLE SPACING
  // ==========================================================

  const TABLE_HEADER_TOP_GAP = 16;
  const TABLE_HEADER_BOTTOM_GAP = 7;

  const TABLE_FIRST_ROW_GAP = 11;

  const MINIMUM_ROW_HEIGHT = 13;

  // ==========================================================
  // TOTAL SPACING
  // ==========================================================

  const TOTAL_TOP_GAP = 12;
  const TOTAL_BOTTOM_GAP = 12;

  // ==========================================================
  // TAGLINE SPACING
  // ==========================================================

  const TAGLINE_TOP_GAP = 18;
  const TAGLINE_BOTTOM_GAP = 14;

  // ==========================================================
  // FIXED FOOTER POSITIONS
  //
  // Footer is always fixed on LAST PAGE.
  // ==========================================================

  const FOOTER_LINE_Y = 241;

  const FOOTER_TITLE_Y = 253;

  const FOOTER_NAME_Y = 261;

  const FOOTER_FSSAI_Y = 268;

  const SIGNATURE_TEXT_Y = 254;

  const SIGNATURE_LINE_Y = 263;

  const FOUNDER_ROLE_Y = 271;

  // ==========================================================
  // PAGE BARS
  // ==========================================================

  const TOP_BAR_HEIGHT = 10;

  const BOTTOM_BAR_HEIGHT = 10;

  const BOTTOM_BAR_Y =
    PAGE_HEIGHT - BOTTOM_BAR_HEIGHT;

  // ==========================================================
  // CONTENT LIMITS
  // ==========================================================

  // Normal continuation pages can use more space because
  // footer will only be shown on final page.
  const CONTINUATION_ITEM_LIMIT = 274;

  // ==========================================================
  // FINAL SECTION SIZE
  //
  // This is the ACTUAL amount of space required after the
  // final product to show:
  //
  // Table bottom line
  // Total
  // Total bottom line
  // Healthy Delight Everyday
  // Tagline bottom line
  //
  // before reaching fixed footer line.
  // ==========================================================

  const FINAL_SECTION_HEIGHT =
    3 +
    TOTAL_TOP_GAP +
    TOTAL_BOTTOM_GAP +
    TAGLINE_TOP_GAP +
    TAGLINE_BOTTOM_GAP;

  // ==========================================================
  // SAFE DATA
  // ==========================================================

  const safeCustomer =
    customer || {};

  const safeItems =
    Array.isArray(items)
      ? items
      : [];

  const safeTotal =
    Number(total || 0);

  const safeFounderName =
    founderName ||
    "Manisha D Shetty";

  // ==========================================================
  // FONT STATUS
  // ==========================================================

  let leagueSpartanLoaded = false;
  let poppinsMediumLoaded = false;
  let poppinsExtraBoldLoaded = false;
  let podkovaLoaded = false;
  let brilliantLoaded = false;

  // ==========================================================
  // LOAD LEAGUE SPARTAN
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

    console.log(
      "League Spartan loaded successfully"
    );
  } catch (error) {
    console.error(
      "League Spartan failed:",
      error
    );
  }

  // ==========================================================
  // LOAD POPPINS MEDIUM
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

    console.log(
      "Poppins Medium loaded successfully"
    );
  } catch (error) {
    console.error(
      "Poppins Medium failed:",
      error
    );
  }

  // ==========================================================
  // LOAD POPPINS EXTRA BOLD
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

    console.log(
      "Poppins ExtraBold loaded successfully"
    );
  } catch (error) {
    console.error(
      "Poppins ExtraBold failed:",
      error
    );
  }

  // ==========================================================
  // LOAD PODKOVA
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

    console.log(
      "Podkova loaded successfully"
    );
  } catch (error) {
    console.error(
      "Podkova failed:",
      error
    );
  }

  // ==========================================================
  // LOAD BRILLIANT
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

    console.log(
      "Brilliant loaded successfully"
    );
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

  const brilliantFont = () => {
    if (brilliantLoaded) {
      doc.setFont(
        "Brilliant",
        "normal"
      );
    } else {
      doc.setFont(
        "helvetica",
        "oblique"
      );
    }
  };

  // ==========================================================
  // DRAW TOP BROWN BAR
  // ==========================================================

  const drawTopBar = () => {
    doc.setFillColor(...BROWN);

    doc.rect(
      0,
      0,
      PAGE_WIDTH,
      TOP_BAR_HEIGHT,
      "F"
    );
  };

  // ==========================================================
  // DRAW BOTTOM GREEN BAR
  // ==========================================================

  const drawBottomBar = () => {
    doc.setFillColor(...GREEN);

    doc.rect(
      0,
      BOTTOM_BAR_Y,
      PAGE_WIDTH,
      BOTTOM_BAR_HEIGHT,
      "F"
    );
  };

  // ==========================================================
  // DRAW MAIN LINE
  // ==========================================================

  const drawMainLine = (lineY) => {
    doc.setDrawColor(...BROWN);

    doc.setLineWidth(0.35);

    doc.line(
      LINE_LEFT,
      lineY,
      LINE_RIGHT,
      lineY
    );
  };

  // ==========================================================
  // DRAW TABLE HEADER
  // ==========================================================

  const drawTableHeader = (
    startingLineY
  ) => {
    let tableY =
      startingLineY +
      TABLE_HEADER_TOP_GAP;

    // --------------------------------------------------------
    // HEADINGS
    // --------------------------------------------------------

    poppinsBoldFont();

    doc.setFontSize(10);

    doc.setTextColor(...BROWN);

    doc.text(
      "Description",
      DESCRIPTION_X,
      tableY
    );

    doc.text(
      "Category",
      CATEGORY_X,
      tableY
    );

    doc.text(
      "Quantity",
      QUANTITY_X,
      tableY
    );

    doc.text(
      "Amount",
      AMOUNT_X,
      tableY,
      {
        align: "right",
      }
    );

    // --------------------------------------------------------
    // FIXED DISTANCE BELOW HEADINGS
    // --------------------------------------------------------

    tableY +=
      TABLE_HEADER_BOTTOM_GAP;

    // --------------------------------------------------------
    // TABLE HEADER BOTTOM LINE
    // --------------------------------------------------------

    drawMainLine(tableY);

    // --------------------------------------------------------
    // FIXED DISTANCE TO FIRST ROW
    // --------------------------------------------------------

    tableY +=
      TABLE_FIRST_ROW_GAP;

    return tableY;
  };

  // ==========================================================
  // DRAW CONTINUATION PAGE
  // ==========================================================

  const createContinuationPage = () => {
    doc.addPage();

    // Brown top border
    drawTopBar();

    // Green bottom border
    drawBottomBar();

    // --------------------------------------------------------
    // INVOICE REFERENCE
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
    // TOP CONTENT DIVIDER
    // --------------------------------------------------------

    drawMainLine(32);

    // --------------------------------------------------------
    // REPEAT TABLE HEADER
    // --------------------------------------------------------

    return drawTableHeader(32);
  };

  // ==========================================================
  // DRAW FINAL SUMMARY PAGE HEADER
  // ==========================================================

  const createFinalSummaryPage = () => {
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

    doc.text(
      "Invoice Summary",
      LINE_RIGHT,
      24,
      {
        align: "right",
      }
    );

    drawMainLine(32);

    return 45;
  };

  // ==========================================================
  // FIRST PAGE BORDERS
  // ==========================================================

  drawTopBar();
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
  // LEAGUE SPARTAN
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
  // LEAGUE SPARTAN
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
  // LEAGUE SPARTAN
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
  // FIRST LINE
  // ==========================================================

  let y = 52;

  drawMainLine(y);

  // ==========================================================
  // BILLED TO
  // LEAGUE SPARTAN
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
  // POPPINS MEDIUM
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
  // POPPINS MEDIUM
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
    !String(
      customerAddress
    ).includes(
      String(
        safeCustomer.pincode
      )
    )
  ) {
    fullAddress =
      `${customerAddress} - ${safeCustomer.pincode}`;
  }

  poppinsMediumFont();

  const addressLines =
    doc.splitTextToSize(
      fullAddress,
      175
    );

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
  // POPPINS MEDIUM
  // ==========================================================

  let customerPhone =
    safeCustomer.phone || "-";

  if (
    customerPhone !== "-" &&
    !String(
      customerPhone
    ).startsWith("+")
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
  // POPPINS MEDIUM
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
  // CUSTOMER SECTION BOTTOM LINE
  // ==========================================================

  y += 10;

  drawMainLine(y);

  // ==========================================================
  // TABLE HEADER
  // ==========================================================

  y = drawTableHeader(y);

  // ==========================================================
  // PRODUCTS
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
        ? `Rs. ${formatMoney(
            row.amount
          )}`
        : "-";

    // ========================================================
    // PREPARE WRAPPED TEXT
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

    // ========================================================
    // CALCULATE ROW HEIGHT
    // ========================================================

    const maximumLines =
      Math.max(
        descriptionLines.length,
        categoryLines.length,
        quantityLines.length,
        1
      );

    const rowHeight =
      Math.max(
        MINIMUM_ROW_HEIGHT,
        maximumLines * 5 + 6
      );

    // ========================================================
    // DETERMINE WHETHER THIS IS LAST PRODUCT
    // ========================================================

    const isLastItem =
      index ===
      safeItems.length - 1;

    // ========================================================
    // PAGE BREAK LOGIC
    //
    // IMPORTANT:
    //
    // If this is the last item, we also check whether
    // Total + Tagline can fit before the fixed footer.
    //
    // This avoids unnecessary extra pages.
    // ========================================================

    if (isLastItem) {
      const spaceNeeded =
        rowHeight +
        FINAL_SECTION_HEIGHT;

      if (
        y + spaceNeeded >
        FOOTER_LINE_Y
      ) {
        y =
          createContinuationPage();
      }
    } else {
      // ------------------------------------------------------
      // NORMAL PRODUCT
      // ------------------------------------------------------

      if (
        y + rowHeight >
        CONTINUATION_ITEM_LIMIT
      ) {
        y =
          createContinuationPage();
      }
    }

    // ========================================================
    // DRAW PRODUCT
    // ========================================================

    poppinsMediumFont();

    doc.setFontSize(9.5);

    doc.setTextColor(...BROWN);

    // Description
    doc.text(
      descriptionLines,
      DESCRIPTION_X,
      y
    );

    // Category
    doc.text(
      categoryLines,
      CATEGORY_X,
      y
    );

    // Quantity
    doc.text(
      quantityLines,
      QUANTITY_X,
      y
    );

    // Amount
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

    y += rowHeight;

    // ========================================================
    // LIGHT ROW DIVIDER
    // ========================================================

    if (!isLastItem) {
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
  // FINAL FIT CHECK
  //
  // This is especially useful if there are ZERO items.
  // ==========================================================

  if (
    y + FINAL_SECTION_HEIGHT >
    FOOTER_LINE_Y
  ) {
    y =
      createFinalSummaryPage();
  }

  // ==========================================================
  // TABLE BOTTOM LINE
  // ==========================================================

  y += 3;

  drawMainLine(y);

  // ==========================================================
  // TOTAL
  //
  // LINE
  // ↓ fixed 12mm
  // TOTAL
  // ↓ fixed 12mm
  // LINE
  // ==========================================================

  y += TOTAL_TOP_GAP;

  poppinsBoldFont();

  doc.setFontSize(11);

  doc.setTextColor(...BROWN);

  // Total label
  doc.text(
    "Total",
    DESCRIPTION_X,
    y
  );

  // Total amount
  doc.text(
    `Rs. ${formatMoney(
      safeTotal
    )}`,
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

  drawMainLine(y);

  // ==========================================================
  // HEALTHY DELIGHT EVERYDAY
  //
  // LINE
  // ↓ fixed 18mm
  // TAGLINE
  // ↓ fixed 14mm
  // LINE
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
  // TAGLINE BOTTOM LINE
  // ==========================================================

  y += TAGLINE_BOTTOM_GAP;

  drawMainLine(y);

  // ==========================================================
  // FIXED FOOTER
  //
  // ONLY ON LAST PAGE
  //
  // This DOES NOT depend on y.
  // ==========================================================

  drawMainLine(
    FOOTER_LINE_Y
  );

  // ==========================================================
  // ISSUED BY
  // POPPINS EXTRA BOLD
  // ==========================================================

  poppinsBoldFont();

  doc.setFontSize(11);

  doc.setTextColor(...BROWN);

  doc.text(
    "Issued By",
    LINE_LEFT,
    FOOTER_TITLE_Y
  );

  // ==========================================================
  // FOUNDER NAME - LEFT
  // POPPINS EXTRA BOLD
  // ==========================================================

  poppinsBoldFont();

  doc.setFontSize(10.5);

  doc.text(
    safeFounderName,
    LINE_LEFT,
    FOOTER_NAME_Y
  );

  // ==========================================================
  // FSSAI
  // POPPINS MEDIUM
  // ==========================================================

  poppinsMediumFont();

  doc.setFontSize(8.5);

  doc.text(
    `FSSAI License No: ${FSSAI_NUMBER}`,
    LINE_LEFT,
    FOOTER_FSSAI_Y
  );

  // ==========================================================
  // SIGNATURE
  // BRILLIANT
  // ==========================================================

  brilliantFont();

  if (brilliantLoaded) {
    doc.setFontSize(20);
  } else {
    doc.setFontSize(14);
  }

  doc.setTextColor(...BROWN);

  doc.text(
    safeFounderName,
    LINE_RIGHT,
    SIGNATURE_TEXT_Y,
    {
      align: "right",
    }
  );

  // ==========================================================
  // SIGNATURE LINE
  // ==========================================================

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
  // POPPINS EXTRA BOLD
  // ==========================================================

  poppinsBoldFont();

  doc.setFontSize(9.5);

  doc.setTextColor(...BROWN);

  doc.text(
    "Founder",
    LINE_RIGHT,
    FOUNDER_ROLE_Y,
    {
      align: "right",
    }
  );

  // ==========================================================
  // MAKE SURE LAST PAGE HAS BOTTOM GREEN BAR
  // ==========================================================

  drawBottomBar();

  // ==========================================================
  // SAVE
  // ==========================================================

  const filename =
    `EatOne-Invoice-${
      invoiceNo ||
      "Invoice"
    }.pdf`;

  doc.save(filename);

  return true;
}
