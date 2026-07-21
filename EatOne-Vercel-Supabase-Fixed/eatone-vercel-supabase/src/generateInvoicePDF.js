import jsPDF from "jspdf";

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
// LOAD IMAGE
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
  // 1. LEAGUE SPARTAN BOLD
  //
  // Used for:
  // Date
  // Invoice No
  // Status
  // Billed to
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

    leagueSpartanLoaded = false;
  }

  // ==========================================================
  // 2. POPPINS MEDIUM
  //
  // Used for normal/customer/product text
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

    poppinsMediumLoaded = false;
  }

  // ==========================================================
  // 3. POPPINS EXTRA BOLD
  //
  // Used for:
  // Description
  // Category
  // Quantity
  // Amount
  // Total
  // Total price
  // Issued By
  // Founder
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

    poppinsExtraBoldLoaded = false;
  }

  // ==========================================================
  // 4. PODKOVA BOLD
  //
  // Used for:
  // Healthy Delight Everyday
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

    podkovaLoaded = false;
  }

  // ==========================================================
  // 5. BRILLIANT
  //
  // Used ONLY for signature
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

    brilliantLoaded = false;
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
  // TOP BAR
  // ==========================================================

  doc.setFillColor(...BROWN);

  doc.rect(
    0,
    0,
    PAGE_WIDTH,
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
      "Logo failed:",
      error
    );

    leagueSpartanFont();

    doc.setFontSize(26);

    doc.setTextColor(...BROWN);

    doc.text(
      "EAT ONE",
      LINE_LEFT,
      29
    );
  }

  // ==========================================================
  // DATE
  // LEAGUE SPARTAN
  // ==========================================================

  const invoiceDate =
    formatInvoiceDate();

  leagueSpartanFont();

  doc.setTextColor(...BROWN);

  doc.setFontSize(12);

  doc.text(
    invoiceDate,
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
  // LEAGUE SPARTAN
  // ==========================================================

  y += 11;

  leagueSpartanFont();

  doc.setFontSize(12);

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

  const address =
    safeCustomer.line ||
    safeCustomer.address ||
    "-";

  let fullAddress =
    String(address);

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
  // POPPINS MEDIUM
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
  // CUSTOMER DIVIDER
  // ==========================================================

  y += 9;

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
  // POPPINS EXTRA BOLD
  // ==========================================================

  y += 18;

  poppinsBoldFont();

  doc.setFontSize(10);

  doc.setTextColor(...BROWN);

  doc.text(
    "Description",
    DESCRIPTION_X,
    y
  );

  doc.text(
    "Category",
    CATEGORY_X,
    y
  );

  doc.text(
    "Quantity",
    QUANTITY_X,
    y
  );

  doc.text(
    "Amount",
    AMOUNT_X,
    y,
    {
      align: "right",
    }
  );

  // ==========================================================
  // TABLE HEADER DIVIDER
  // ==========================================================

  y += 6;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.35);

  doc.line(
    LINE_LEFT,
    y,
    LINE_RIGHT,
    y
  );

  y += 11;

  // ==========================================================
  // PRODUCT ROWS
  // POPPINS MEDIUM
  // ==========================================================

  poppinsMediumFont();

  doc.setFontSize(9.5);

  safeItems.forEach(
    (row, index) => {
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
          ? `Rs. ${formatMoney(
              row.amount
            )}`
          : "-";

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

      poppinsMediumFont();

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

      const rowHeight =
        Math.max(
          13,
          maximumLines * 5 + 6
        );

      y += rowHeight;

      if (
        index <
        safeItems.length - 1
      ) {
        doc.setDrawColor(
          215,
          215,
          215
        );

        doc.setLineWidth(
          0.15
        );

        doc.line(
          LINE_LEFT,
          y - 4,
          LINE_RIGHT,
          y - 4
        );
      }
    }
  );

  // ==========================================================
  // LINE ABOVE TOTAL
  // ==========================================================

  y += 2;

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
  // POPPINS EXTRA BOLD
  // ==========================================================

  y += 12;

  poppinsBoldFont();

  doc.setFontSize(11);

  doc.text(
    "Total",
    DESCRIPTION_X,
    y
  );

  // ==========================================================
  // TOTAL PRICE
  // POPPINS EXTRA BOLD
  // ==========================================================

  poppinsBoldFont();

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
  // OPTIONAL SHIPPING DETAILS
  // ==========================================================

  if (
    deliveryPartner ||
    trackingId
  ) {
    y += 11;

    poppinsBoldFont();

    doc.setFontSize(10);

    doc.text(
      "Shipping Details",
      LINE_LEFT,
      y
    );

    y += 7;

    poppinsMediumFont();

    doc.setFontSize(9);

    if (deliveryPartner) {
      doc.text(
        `Delivery Partner: ${deliveryPartner}`,
        LINE_LEFT,
        y
      );

      y += 6;
    }

    if (trackingId) {
      doc.text(
        `Tracking ID: ${trackingId}`,
        LINE_LEFT,
        y
      );

      y += 6;
    }
  }

  // ==========================================================
  // HEALTHY DELIGHT EVERYDAY
  // PODKOVA BOLD
  // ==========================================================

  y = Math.max(
    y + 16,
    190
  );

  if (y > 198) {
    y = 198;
  }

  podkovaFont();

  doc.setFontSize(12);

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
  // DIVIDER ABOVE ISSUED BY
  // ==========================================================

  y += 12;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.35);

  doc.line(
    LINE_LEFT,
    y,
    LINE_RIGHT,
    y
  );

  // ==========================================================
  // ISSUED BY
  // POPPINS EXTRA BOLD
  // ==========================================================

  y += 13;

  poppinsBoldFont();

  doc.setFontSize(11);

  doc.setTextColor(...BROWN);

  doc.text(
    "Issued By",
    LINE_LEFT,
    y
  );

  // ==========================================================
  // FOUNDER NAME LEFT
  // POPPINS EXTRA BOLD
  // ==========================================================

  y += 8;

  poppinsBoldFont();

  doc.setFontSize(11);

  doc.text(
    safeFounderName,
    LINE_LEFT,
    y
  );

  // ==========================================================
  // FSSAI
  // POPPINS MEDIUM
  // ==========================================================

  y += 7;

  poppinsMediumFont();

  doc.setFontSize(9);

  doc.text(
    `FSSAI License No: ${FSSAI_NUMBER}`,
    LINE_LEFT,
    y
  );

  // ==========================================================
  // SIGNATURE
  // BRILLIANT
  // ==========================================================

  const signatureY =
    y - 13;

  brilliantFont();

  doc.setTextColor(...BROWN);

  if (brilliantLoaded) {
    doc.setFontSize(19);
  } else {
    doc.setFontSize(14);
  }

  doc.text(
    safeFounderName,
    LINE_RIGHT,
    signatureY,
    {
      align: "right",
    }
  );

  // ==========================================================
  // SIGNATURE LINE
  // ==========================================================

  const signatureLineY =
    signatureY + 7;

  doc.setDrawColor(...BROWN);

  doc.setLineWidth(0.3);

  doc.line(
    142,
    signatureLineY,
    LINE_RIGHT,
    signatureLineY
  );

  // ==========================================================
  // FOUNDER
  // POPPINS EXTRA BOLD
  // ==========================================================

  poppinsBoldFont();

  doc.setFontSize(10);

  doc.text(
    "Founder",
    LINE_RIGHT,
    signatureLineY + 8,
    {
      align: "right",
    }
  );

  // ==========================================================
  // BOTTOM GREEN BAR
  // ==========================================================

  doc.setFillColor(...GREEN);

  doc.rect(
    0,
    PAGE_HEIGHT - 10,
    PAGE_WIDTH,
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
