import jsPDF from "jspdf";

// ============================================================
// EAT ONE BRAND SETTINGS
// ============================================================

const BROWN = [42, 32, 22];
const GREEN = [63, 109, 62];

const BRAND_TAGLINE = "Healthy Delight Everyday";
const FSSAI_NUMBER = "21226008002884";

// ============================================================
// LOAD FILE AS BASE64
// Used for custom fonts
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

  const DESCRIPTION_X = 14;
  const CATEGORY_X = 88;
  const QUANTITY_X = 132;
  const AMOUNT_X = 190;

  const safeCustomer = customer || {};

  const safeItems = Array.isArray(items)
    ? items
    : [];

  const safeTotal = Number(total || 0);

  const safeFounderName =
    founderName || "Manisha D Shetty";

  // ==========================================================
  // CUSTOM FONT FLAGS
  // ==========================================================

  let poppinsLoaded = false;
  let spartanLoaded = false;
  let brilliantLoaded = false;

  // ==========================================================
  // LOAD POPPINS
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

    // Test the font immediately.
    // If jsPDF cannot use it, fallback will be used.
    doc.setFont(
      "Poppins",
      "normal"
    );

    doc.getTextWidth("Font Test");

    poppinsLoaded = true;

    console.log(
      "Poppins loaded successfully"
    );
  } catch (error) {
    poppinsLoaded = false;

    console.error(
      "Poppins font failed. Using Helvetica fallback:",
      error
    );

    doc.setFont(
      "helvetica",
      "normal"
    );
  }

  // ==========================================================
  // LOAD LEAGUE SPARTAN
  //
  // IMPORTANT:
  // Your actual file is:
  //
  // LeagueSpartan-Bold.otf
  //
  // NOT:
  //
  // LeagueSpartan-Bold.ttf
  // ==========================================================

  try {
    const spartanBase64 =
      await loadFileAsBase64(
        "/LeagueSpartan-Bold.otf"
      );

    doc.addFileToVFS(
      "LeagueSpartan-Bold.otf",
      spartanBase64
    );

    doc.addFont(
      "LeagueSpartan-Bold.otf",
      "LeagueSpartan",
      "bold"
    );

    doc.setFont(
      "LeagueSpartan",
      "bold"
    );

    doc.getTextWidth("Font Test");

    spartanLoaded = true;

    console.log(
      "League Spartan loaded successfully"
    );
  } catch (error) {
    spartanLoaded = false;

    console.error(
      "League Spartan font failed. Using Helvetica Bold fallback:",
      error
    );

    doc.setFont(
      "helvetica",
      "bold"
    );
  }

  // ==========================================================
  // LOAD BRILLIANT SIGNATURE FONT
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

    doc.getTextWidth("Manisha D Shetty");

    brilliantLoaded = true;

    console.log(
      "Brilliant loaded successfully"
    );
  } catch (error) {
    brilliantLoaded = false;

    console.error(
      "Brilliant font failed. Using Helvetica Oblique fallback:",
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
    try {
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
    } catch (error) {
      console.error(
        "Poppins usage failed:",
        error
      );

      doc.setFont(
        "helvetica",
        "normal"
      );
    }
  };

  const boldFont = () => {
    try {
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
    } catch (error) {
      console.error(
        "League Spartan usage failed:",
        error
      );

      doc.setFont(
        "helvetica",
        "bold"
      );
    }
  };

  const signatureFont = () => {
    try {
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
    } catch (error) {
      console.error(
        "Brilliant usage failed:",
        error
      );

      doc.setFont(
        "helvetica",
        "oblique"
      );
    }
  };

  // ==========================================================
  // TOP BROWN BORDER
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
      "Logo loading failed:",
      error
    );

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
  // DATE / INVOICE / STATUS
  // League Spartan Bold
  // ==========================================================

  const invoiceDate =
    formatInvoiceDate();

  boldFont();

  doc.setTextColor(...BROWN);

  // DATE

  doc.setFontSize(12);

  doc.text(
    invoiceDate,
    LINE_RIGHT,
    20,
    {
      align: "right",
    }
  );

  // INVOICE NUMBER

  doc.setFontSize(11);

  doc.text(
    `Invoice No. ${invoiceNo || "-"}`,
    LINE_RIGHT,
    28,
    {
      align: "right",
    }
  );

  // STATUS

  let displayStatus =
    status || "Paid";

  if (
    String(displayStatus)
      .toLowerCase() === "paid"
  ) {
    displayStatus = "Paid";
  }

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
    safeCustomer.name || "-",
    LINE_LEFT,
    y
  );

  // ==========================================================
  // ADDRESS
  // Poppins
  // ==========================================================

  y += 7;

  const address =
    safeCustomer.line ||
    safeCustomer.address ||
    "-";

  let fullAddress = address;

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
  // PHONE
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
    customerPhone,
    LINE_LEFT,
    y
  );

  // ==========================================================
  // ORDER ID
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
  // CUSTOMER SECTION DIVIDER
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

  y += 11;

  // ==========================================================
  // PRODUCT ROWS
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
      // WRAP TEXT
      // ======================================================

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

      const maximumLines =
        Math.max(
          descriptionLines.length,
          categoryLines.length,
          quantityLines.length,
          1
        );

      // ======================================================
      // DRAW PRODUCT
      // ======================================================

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
  // OPTIONAL SHIPPING DETAILS
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
  // HEALTHY DELIGHT EVERYDAY
  // League Spartan Bold
  // ==========================================================

  y = Math.max(
    y + 20,
    195
  );

  if (y > 220) {
    y = 220;
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
  // FOUNDER NAME - LEFT
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

  // Brilliant signature should be larger
  if (brilliantLoaded) {
    doc.setFontSize(17);
  } else {
    doc.setFontSize(15);
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
  // FOUNDER
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
  // BOTTOM GREEN BORDER
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
      invoiceNo ||
      "Invoice"
    }.pdf`;

  doc.save(filename);

  return true;
}
