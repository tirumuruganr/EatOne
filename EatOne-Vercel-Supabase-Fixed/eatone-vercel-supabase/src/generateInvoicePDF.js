import jsPDF from "jspdf";

// ============================================================
// EAT ONE - INVOICE PDF GENERATOR
// ============================================================

// ============================================================
// BRAND SETTINGS
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

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;

  const LINE_LEFT = 14;
  const LINE_RIGHT = 196;

  // ==========================================================
  // TABLE COLUMN POSITIONS
  // ==========================================================

  const DESCRIPTION_X = 14;
  const CATEGORY_X = 88;
  const QUANTITY_X = 132;
  const AMOUNT_X = 190;

  // ==========================================================
  // TABLE SETTINGS
  // ==========================================================

  const TABLE_HEADER_HEIGHT = 16;
  const TABLE_FIRST_ROW_GAP = 10;
  const MINIMUM_ROW_HEIGHT = 13;

  // ==========================================================
  // TOTAL SECTION
  // ==========================================================

  const TOTAL_TOP_GAP = 12;
  const TOTAL_BOTTOM_GAP = 12;

  // ==========================================================
  // TAGLINE
  // ==========================================================

  const TAGLINE_TOP_GAP = 18;

  // ==========================================================
  // FOOTER POSITIONS
  // ==========================================================

  const FOOTER_LINE_Y = 241;

  const FOOTER_TITLE_Y = 253;
  const FOOTER_NAME_Y = 261;
  const FOOTER_FSSAI_Y = 268;

  // ==========================================================
  // SIGNATURE POSITIONS
  // ==========================================================

  const SIGNATURE_LINE_START_X = 142;
  const SIGNATURE_LINE_END_X = 196;

  const SIGNATURE_CENTER_X =
    (SIGNATURE_LINE_START_X + SIGNATURE_LINE_END_X) / 2;

  const SIGNATURE_LINE_Y = 261;

  // ==========================================================
  // SIGNATURE IMAGE SETTINGS
  //
  // signature.png is in public folder.
  //
  // Image will appear ABOVE signature line.
  // ==========================================================

  const SIGNATURE_IMAGE_WIDTH = 65;
  const SIGNATURE_IMAGE_HEIGHT = 22;

  const SIGNATURE_IMAGE_X =
    SIGNATURE_CENTER_X - SIGNATURE_IMAGE_WIDTH / 2;

  const SIGNATURE_IMAGE_Y = 238;

  // ==========================================================
  // FOUNDER
  // ==========================================================

  const FOUNDER_ROLE_Y = 269;

  // ==========================================================
  // PAGE BORDERS
  // ==========================================================

  const TOP_BAR_HEIGHT = 10;
  const BOTTOM_BAR_HEIGHT = 10;

  const BOTTOM_BAR_Y =
    PAGE_HEIGHT - BOTTOM_BAR_HEIGHT;

  // ==========================================================
  // PAGE BREAK SETTINGS
  // ==========================================================

  const CONTINUATION_ITEM_LIMIT = 274;

  const FINAL_SECTION_HEIGHT =
    TOTAL_TOP_GAP +
    TOTAL_BOTTOM_GAP +
    TAGLINE_TOP_GAP +
    20;

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

  // ==========================================================
  // LOAD LEAGUE SPARTAN
  // ==========================================================

  try {
    const base64 =
      await loadFileAsBase64(
        "/league-spartan-bold.ttf"
      );

    doc.addFileToVFS(
      "league-spartan-bold.ttf",
      base64
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

    doc.getTextWidth("League Spartan");

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
    const base64 =
      await loadFileAsBase64(
        "/Poppins-Medium.ttf"
      );

    doc.addFileToVFS(
      "Poppins-Medium.ttf",
      base64
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

    doc.getTextWidth("Poppins Medium");

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
    const base64 =
      await loadFileAsBase64(
        "/Poppins-ExtraBold.ttf"
      );

    doc.addFileToVFS(
      "Poppins-ExtraBold.ttf",
      base64
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

    doc.getTextWidth("Poppins ExtraBold");

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
    const base64 =
      await loadFileAsBase64(
        "/Podkova-Bold.ttf"
      );

    doc.addFileToVFS(
      "Podkova-Bold.ttf",
      base64
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

    doc.getTextWidth(BRAND_TAGLINE);

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
  // DRAW TOP BROWN BORDER
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
  // DRAW BOTTOM GREEN BORDER
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
  // DRAW STANDARD LINE
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

  const drawTableHeader = (startingY) => {
    // Top line
    drawMainLine(startingY);

    // Text is 8 mm below top line
    const HEADER_TEXT_Y =
      startingY + 8;

    poppinsBoldFont();

    doc.setFontSize(10);

    doc.setTextColor(...BROWN);

    doc.text(
      "Description",
      DESCRIPTION_X,
      HEADER_TEXT_Y
    );

    doc.text(
      "Category",
      CATEGORY_X,
      HEADER_TEXT_Y
    );

    doc.text(
      "Quantity",
      QUANTITY_X,
      HEADER_TEXT_Y
    );

    doc.text(
      "Amount",
      AMOUNT_X,
      HEADER_TEXT_Y,
      {
        align: "right",
      }
    );

    // Bottom line
    const BOTTOM_LINE_Y =
      startingY +
      TABLE_HEADER_HEIGHT;

    drawMainLine(
      BOTTOM_LINE_Y
    );

    return (
      BOTTOM_LINE_Y +
      TABLE_FIRST_ROW_GAP
    );
  };

  // ==========================================================
  // CONTINUATION PAGE
  // ==========================================================

  const createContinuationPage = () => {
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
      "Continued",
      LINE_RIGHT,
      24,
      {
        align: "right",
      }
    );

    return drawTableHeader(34);
  };

  // ==========================================================
  // FINAL SUMMARY PAGE
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

    drawMainLine(34);

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
  // HEADER DIVIDER
  // ==========================================================

  let y = 52;

  drawMainLine(y);

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
  // PHONE NUMBER
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
  // TABLE
  // ==========================================================

  y += 10;

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
        ? `Rs. ${formatMoney(
            row.amount
          )}`
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

    const isLastItem =
      index ===
      safeItems.length - 1;

    // ========================================================
    // PAGE BREAK CHECK
    // ========================================================

    if (isLastItem) {
      const requiredSpace =
        rowHeight +
        FINAL_SECTION_HEIGHT;

      if (
        y + requiredSpace >
        FOOTER_LINE_Y
      ) {
        y =
          createContinuationPage();
      }
    } else {
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

    y += rowHeight;

    // ========================================================
    // PRODUCT SEPARATOR
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
  // CHECK FINAL SECTION FIT
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
  // LINE BELOW TOTAL
  // ==========================================================

  y += TOTAL_BOTTOM_GAP;

  drawMainLine(y);

  // ==========================================================
  // HEALTHY DELIGHT EVERYDAY
  // PODKOVA
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
  // SINGLE FOOTER DIVIDER
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
  // FOUNDER NAME - LEFT SIDE
  // ==========================================================

  poppinsBoldFont();

  doc.setFontSize(10.5);

  doc.text(
    safeFounderName,
    LINE_LEFT,
    FOOTER_NAME_Y
  );

  // ==========================================================
  // FSSAI NUMBER
  // ==========================================================

  poppinsMediumFont();

  doc.setFontSize(8.5);

  doc.text(
    `FSSAI License No: ${FSSAI_NUMBER}`,
    LINE_LEFT,
    FOOTER_FSSAI_Y
  );

  // ==========================================================
  // SIGNATURE IMAGE
  //
  // FILE:
  // public/signature.png
  //
  // No Brilliant.ttf required anymore.
  // ==========================================================

  try {
    const signatureImage =
      await loadImageAsDataURL(
        "/signature.png"
      );

    doc.addImage(
      signatureImage,
      "PNG",
      SIGNATURE_IMAGE_X,
      SIGNATURE_IMAGE_Y,
      SIGNATURE_IMAGE_WIDTH,
      SIGNATURE_IMAGE_HEIGHT
    );

    console.log(
      "Signature image loaded successfully"
    );
  } catch (error) {
    console.error(
      "Signature image failed:",
      error
    );

    // ========================================================
    // FALLBACK
    //
    // If signature.png cannot load,
    // Manisha D Shetty will still appear.
    // ========================================================

    doc.setFont(
      "helvetica",
      "italic"
    );

    doc.setFontSize(16);

    doc.setTextColor(...BROWN);

    doc.text(
      "Manisha D Shetty",
      SIGNATURE_CENTER_X,
      255,
      {
        align: "center",
      }
    );
  }

  // ==========================================================
  // SIGNATURE LINE
  // ==========================================================

  doc.setDrawColor(...BROWN);

  doc.setLineWidth(0.3);

  doc.line(
    SIGNATURE_LINE_START_X,
    SIGNATURE_LINE_Y,
    SIGNATURE_LINE_END_X,
    SIGNATURE_LINE_Y
  );

  // ==========================================================
  // FOUNDER
  //
  // POPPINS EXTRA BOLD
  // FONT SIZE = 17
  // ==========================================================

  poppinsBoldFont();

  doc.setFontSize(17);

  doc.setTextColor(...BROWN);

  doc.text(
    "Founder",
    SIGNATURE_CENTER_X,
    FOUNDER_ROLE_Y,
    {
      align: "center",
    }
  );

  // ==========================================================
  // MAKE SURE GREEN BORDER IS PRESENT
  // ==========================================================

  drawBottomBar();

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
