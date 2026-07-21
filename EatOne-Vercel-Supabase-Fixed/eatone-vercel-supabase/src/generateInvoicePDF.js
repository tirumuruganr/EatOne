import jsPDF from "jspdf";

// ============================================================
// EAT ONE BRAND SETTINGS
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

  // Every main horizontal line uses these same coordinates
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

  let poppinsLoaded = false;
  let spartanLoaded = false;
  let brilliantLoaded = false;

  // ==========================================================
  // LOAD POPPINS MEDIUM
  //
  // Exact filename:
  // public/Poppins-Medium.ttf
  // ==========================================================

  try {
    const poppinsBase64 =
      await loadFileAsBase64(
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

    doc.setFont(
      "Poppins",
      "normal"
    );

    // Test whether jsPDF can actually use it
    doc.getTextWidth(
      "Poppins Test"
    );

    poppinsLoaded = true;

    console.log(
      "Poppins loaded successfully"
    );
  } catch (error) {
    poppinsLoaded = false;

    console.error(
      "Poppins failed - using Helvetica:",
      error
    );

    doc.setFont(
      "helvetica",
      "normal"
    );
  }

  // ==========================================================
  // LOAD LEAGUE SPARTAN BOLD
  //
  // IMPORTANT:
  // This matches your EXACT filename:
  //
  // public/league-spartan-bold.ttf
  //
  // LOWERCASE!
  // ==========================================================

  try {
    const spartanBase64 =
      await loadFileAsBase64(
        "/league-spartan-bold.ttf"
      );

    doc.addFileToVFS(
      "league-spartan-bold.ttf",
      spartanBase64
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

    // Test whether jsPDF can use it
    doc.getTextWidth(
      "League Spartan Test"
    );

    spartanLoaded = true;

    console.log(
      "League Spartan TTF loaded successfully"
    );
  } catch (error) {
    spartanLoaded = false;

    console.error(
      "League Spartan failed - using Helvetica Bold:",
      error
    );

    doc.setFont(
      "helvetica",
      "bold"
    );
  }

  // ==========================================================
  // LOAD BRILLIANT SIGNATURE FONT
  //
  // Exact filename:
  // public/Brilliant.ttf
  // ==========================================================

  try {
    const brilliantBase64 =
      await loadFileAsBase64(
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

    doc.setFont(
      "Brilliant",
      "normal"
    );

    // Test font
    doc.getTextWidth(
      "Manisha D Shetty"
    );

    brilliantLoaded = true;

    console.log(
      "Brilliant loaded successfully"
    );
  } catch (error) {
    brilliantLoaded = false;

    console.error(
      "Brilliant failed - using Helvetica Oblique:",
      error
    );

    doc.setFont(
      "helvetica",
      "oblique"
    );
  }

  // ==========================================================
  // FONT HELPERS
  // ==========================================================

  const normalFont = () => {
    if (poppinsLoaded) {
      doc.setFont(
        "Poppins",
        "normal"
      );
    } else {
      doc.setFont(
        "helvetica",
        "normal"
      );
    }
  };

  const boldFont = () => {
    if (spartanLoaded) {
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

  const signatureFont = () => {
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
  // TOP BROWN BAR
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
  //
  // Exact filename:
  // public/eatone-logo.png
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

    // Fallback brand text
    boldFont();

    doc.setFontSize(27);

    doc.setTextColor(...BROWN);

    doc.text(
      "EAT ONE",
      LINE_LEFT,
      29
    );

    normalFont();

    doc.setFontSize(10);

    doc.text(
      BRAND_TAGLINE,
      LINE_LEFT,
      37
    );
  }

  // ==========================================================
  // DATE
  // League Spartan Bold
  // ==========================================================

  const invoiceDate =
    formatInvoiceDate();

  boldFont();

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
  // League Spartan Bold
  // ==========================================================

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
  // League Spartan Bold
  // ==========================================================

  let displayStatus =
    status || "Paid";

  if (
    String(displayStatus)
      .toLowerCase() === "paid"
  ) {
    displayStatus = "Paid";
  }

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
  // FIRST HORIZONTAL LINE
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
  // League Spartan Bold
  // ==========================================================

  y += 11;

  boldFont();

  doc.setFontSize(12);

  doc.text(
    "Billed to:",
    LINE_LEFT,
    y
  );

  // ==========================================================
  // CUSTOMER NAME
  // Poppins
  // ==========================================================

  y += 8;

  normalFont();

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
  // Poppins
  // ==========================================================

  y += 7;

  const address =
    safeCustomer.line ||
    safeCustomer.address ||
    "-";

  let fullAddress =
    String(address);

  // Add pincode only if it isn't already in the address
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
  // Poppins
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

  doc.text(
    String(customerPhone),
    LINE_LEFT,
    y
  );

  // ==========================================================
  // ORDER ID
  // Poppins
  // ==========================================================

  if (orderId) {
    y += 6;

    doc.text(
      `Order ID: ${orderId}`,
      LINE_LEFT,
      y
    );
  }

  // ==========================================================
  // CUSTOMER SECTION LINE
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
  // TABLE
  // ==========================================================

  y += 18;

  // ==========================================================
  // TABLE HEADER
  // League Spartan Bold
  // ==========================================================

  boldFont();

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
  // TABLE HEADER LINE
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

  // Space before first row
  y += 11;

  // ==========================================================
  // PRODUCT / SHIPPING ROWS
  // Poppins
  // ==========================================================

  normalFont();

  doc.setFontSize(9.5);

  safeItems.forEach(
    (row, index) => {
      const description =
        row?.description ||
        "-";

      const category =
        row?.category ||
        "-";

      const quantity =
        String(
          row?.quantity ||
          "-"
        );

      const amount =
        row?.amount !== undefined &&
        row?.amount !== null
          ? `Rs. ${formatMoney(
              row.amount
            )}`
          : "-";

      // ======================================================
      // WRAP LONG TEXT
      // ======================================================

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

      // ======================================================
      // DRAW DESCRIPTION
      // ======================================================

      doc.text(
        descriptionLines,
        DESCRIPTION_X,
        y
      );

      // ======================================================
      // DRAW CATEGORY
      // ======================================================

      doc.text(
        categoryLines,
        CATEGORY_X,
        y
      );

      // ======================================================
      // DRAW QUANTITY
      // ======================================================

      doc.text(
        quantityLines,
        QUANTITY_X,
        y
      );

      // ======================================================
      // DRAW AMOUNT
      // ======================================================

      doc.text(
        amount,
        AMOUNT_X,
        y,
        {
          align: "right",
        }
      );

      // ======================================================
      // ROW HEIGHT
      // ======================================================

      const rowHeight =
        Math.max(
          13,
          maximumLines * 5 + 6
        );

      y += rowHeight;

      // ======================================================
      // LIGHT ROW SEPARATOR
      // ======================================================

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
  // League Spartan Bold
  // ==========================================================

  y += 12;

  boldFont();

  doc.setFontSize(11);

  doc.text(
    "Total",
    DESCRIPTION_X,
    y
  );

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
  // OPTIONAL DELIVERY / TRACKING INFORMATION
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
      LINE_LEFT,
      y
    );

    y += 7;

    normalFont();

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
  // BRAND TAGLINE
  // League Spartan Bold
  // ==========================================================

  y = Math.max(
    y + 18,
    195
  );

  // Prevent footer from being pushed too far down
  if (y > 215) {
    y = 215;
  }

  boldFont();

  doc.setFontSize(11);
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
  // LINE ABOVE ISSUED BY
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
  // League Spartan Bold
  // ==========================================================

  y += 13;

  boldFont();

  doc.setFontSize(11);

  doc.text(
    "Issued By",
    LINE_LEFT,
    y
  );

  // ==========================================================
  // FOUNDER NAME - LEFT SIDE
  // League Spartan Bold
  // ==========================================================

  y += 8;

  boldFont();

  doc.setFontSize(11);

  doc.text(
    safeFounderName,
    LINE_LEFT,
    y
  );

  // ==========================================================
  // FSSAI LICENSE
  // Poppins
  // ==========================================================

  y += 7;

  normalFont();

  doc.setFontSize(9);

  doc.text(
    `FSSAI License No: ${FSSAI_NUMBER}`,
    LINE_LEFT,
    y
  );

  // ==========================================================
  // SIGNATURE - RIGHT SIDE
  // Brilliant.ttf
  // ==========================================================

  const signatureY =
    y - 10;

  signatureFont();

  if (brilliantLoaded) {
    doc.setFontSize(17);
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
    signatureY + 6;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.3);

  doc.line(
    142,
    signatureLineY,
    LINE_RIGHT,
    signatureLineY
  );

  // ==========================================================
  // FOUNDER ROLE
  // League Spartan Bold
  // ==========================================================

  boldFont();

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
