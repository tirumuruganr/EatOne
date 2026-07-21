import jsPDF from "jspdf";

// ============================================================
// BRAND
// ============================================================

const BROWN = [42, 32, 22];
const GREEN = [63, 109, 62];

const BRAND_TAGLINE =
  "Healthy Delight Everyday";

const FSSAI_NUMBER =
  "21226008002884";

// ============================================================
// LOAD FILE AS BASE64
// ============================================================

async function loadFileAsBase64(
  url
) {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Could not load file: ${url}`
    );
  }

  const buffer =
    await response.arrayBuffer();

  const bytes =
    new Uint8Array(buffer);

  let binary = "";

  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {
    binary +=
      String.fromCharCode(
        bytes[i]
      );
  }

  return btoa(binary);
}

// ============================================================
// LOAD IMAGE
// ============================================================

async function loadImageAsDataURL(
  url
) {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Could not load image: ${url}`
    );
  }

  const blob =
    await response.blob();

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const reader =
        new FileReader();

      reader.onloadend =
        () =>
          resolve(
            reader.result
          );

      reader.onerror =
        reject;

      reader.readAsDataURL(
        blob
      );
    }
  );
}

// ============================================================
// FORMAT MONEY
// ============================================================

function formatMoney(
  value
) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-IN"
  );
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

  const doc =
    new jsPDF({
      orientation:
        "portrait",

      unit:
        "mm",

      format:
        "a4",
    });

  const pageWidth =
    210;

  const pageHeight =
    297;

  const safeCustomer =
    customer || {};

  const safeItems =
    Array.isArray(items)
      ? items
      : [];

  const safeTotal =
    Number(
      total || 0
    );

  // ==========================================================
  // LOAD POPPINS
  // ==========================================================

  let poppinsLoaded =
    false;

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

    poppinsLoaded =
      true;
  } catch (error) {
    console.error(
      "Poppins font failed:",
      error
    );
  }

  // ==========================================================
  // LOAD LEAGUE SPARTAN BOLD
  // ==========================================================

  let leagueSpartanLoaded =
    false;

  try {
    const spartanBase64 =
      await loadFileAsBase64(
        "/LeagueSpartan-Bold.ttf"
      );

    doc.addFileToVFS(
      "LeagueSpartan-Bold.ttf",
      spartanBase64
    );

    doc.addFont(
      "LeagueSpartan-Bold.ttf",
      "LeagueSpartan",
      "bold"
    );

    leagueSpartanLoaded =
      true;
  } catch (error) {
    console.error(
      "League Spartan font failed:",
      error
    );
  }

  // ==========================================================
  // LOAD BRILLIANT
  // ==========================================================

  let brilliantLoaded =
    false;

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

    brilliantLoaded =
      true;
  } catch (error) {
    console.error(
      "Brilliant font failed:",
      error
    );
  }

  // ==========================================================
  // FONT HELPERS
  // ==========================================================

  const normalFont =
    () => {
      if (
        poppinsLoaded
      ) {
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

  const boldFont =
    () => {
      if (
        leagueSpartanLoaded
      ) {
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

  // ==========================================================
  // TOP BROWN BORDER
  // ==========================================================

  doc.setFillColor(
    ...BROWN
  );

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
      13,
      85,
      38
    );
  } catch (error) {
    console.error(
      "Logo failed:",
      error
    );

    boldFont();

    doc.setFontSize(
      25
    );

    doc.setTextColor(
      ...BROWN
    );

    doc.text(
      "EAT ONE",
      14,
      30
    );

    normalFont();

    doc.setFontSize(
      10
    );

    doc.text(
      BRAND_TAGLINE,
      14,
      38
    );
  }

  // ==========================================================
  // DATE
  // ==========================================================

  const dateStr =
    new Date()
      .toLocaleDateString(
        "en-IN",
        {
          day:
            "2-digit",

          month:
            "long",

          year:
            "numeric",
        }
      );

  // ==========================================================
  // TOP RIGHT INFORMATION
  // ==========================================================

  boldFont();

  doc.setTextColor(
    ...BROWN
  );

  doc.setFontSize(
    11
  );

  doc.text(
    dateStr,
    196,
    20,
    {
      align:
        "right",
    }
  );

  doc.text(
    `Invoice No. ${
      invoiceNo || "-"
    }`,
    196,
    27,
    {
      align:
        "right",
    }
  );

  doc.text(
    `Status: ${
      status || "Paid"
    }`,
    196,
    34,
    {
      align:
        "right",
    }
  );

  // ==========================================================
  // FIRST DIVIDER
  // ==========================================================

  let y = 48;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.4
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 10;

  // ==========================================================
  // BILLED TO
  // ==========================================================

  boldFont();

  doc.setFontSize(
    13
  );

  doc.text(
    "Billed to:",
    14,
    y
  );

  y += 8;

  // Customer name

  normalFont();

  doc.setFontSize(
    10.5
  );

  doc.text(
    safeCustomer.name ||
      "-",
    14,
    y
  );

  y += 7;

  // ==========================================================
  // CUSTOMER ADDRESS
  // ==========================================================

  const address =
    safeCustomer.line ||
    safeCustomer.address ||
    "-";

  let fullAddress =
    address;

  if (
    safeCustomer.pincode &&
    !String(
      address
    ).includes(
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
      addressLines.length,
      1
    ) * 6;

  // ==========================================================
  // PHONE
  // ==========================================================

  let phone =
    safeCustomer.phone ||
    "-";

  if (
    phone !== "-" &&
    !String(
      phone
    ).startsWith("+")
  ) {
    phone =
      `+91 ${phone}`;
  }

  doc.text(
    phone,
    14,
    y
  );

  y += 9;

  // Customer divider

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.3
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  // ==========================================================
  // TABLE START
  // ==========================================================

  y += 20;

  // ==========================================================
  // TABLE HEADER
  // ==========================================================

  boldFont();

  doc.setFontSize(
    10
  );

  doc.setTextColor(
    ...BROWN
  );

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
    132,
    y
  );

  doc.text(
    "Amount",
    190,
    y,
    {
      align:
        "right",
    }
  );

  // Header line

  y += 5;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.35
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 9;

  // ==========================================================
  // TABLE ITEMS
  // ==========================================================

  normalFont();

  doc.setFontSize(
    9.5
  );

  safeItems.forEach(
    (row) => {
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

      const descriptionLines =
        doc.splitTextToSize(
          description,
          65
        );

      const categoryLines =
        doc.splitTextToSize(
          category,
          37
        );

      const quantityLines =
        doc.splitTextToSize(
          quantity,
          35
        );

      const lineCount =
        Math.max(
          descriptionLines.length,
          categoryLines.length,
          quantityLines.length,
          1
        );

      const rowHeight =
        Math.max(
          13,
          lineCount *
            6 +
            5
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
        132,
        y
      );

      // Amount

      const amount =
        row?.amount !==
          undefined &&
        row?.amount !==
          null
          ? `Rs. ${formatMoney(
              row.amount
            )}`
          : "-";

      doc.text(
        amount,
        190,
        y,
        {
          align:
            "right",
        }
      );

      // Move down

      y +=
        rowHeight;

      // ======================================================
      // CLEAN ROW DIVIDER
      // ======================================================

      doc.setDrawColor(
        190,
        190,
        190
      );

      doc.setLineWidth(
        0.2
      );

      doc.line(
        14,
        y - 4,
        196,
        y - 4
      );
    }
  );

  // ==========================================================
  // TOTAL
  // ==========================================================

  y += 3;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.35
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 10;

  boldFont();

  doc.setFontSize(
    11
  );

  doc.text(
    "Total",
    14,
    y
  );

  doc.text(
    `Rs. ${formatMoney(
      safeTotal
    )}`,
    190,
    y,
    {
      align:
        "right",
    }
  );

  // Total bottom line

  y += 8;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.35
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  // ==========================================================
  // SHIPPING TRACKING DETAILS
  // ==========================================================

  if (
    deliveryPartner ||
    trackingId
  ) {
    y += 10;

    boldFont();

    doc.setFontSize(
      9.5
    );

    doc.text(
      "Shipping Details",
      14,
      y
    );

    y += 6;

    normalFont();

    doc.setFontSize(
      9
    );

    if (
      deliveryPartner
    ) {
      doc.text(
        `Delivery Partner: ${deliveryPartner}`,
        14,
        y
      );

      y += 6;
    }

    if (
      trackingId
    ) {
      doc.text(
        `Tracking ID: ${trackingId}`,
        14,
        y
      );

      y += 6;
    }
  }

  // ==========================================================
  // BRAND TAGLINE
  // ==========================================================

  y =
    Math.max(
      y + 20,
      195
    );

  normalFont();

  doc.setFontSize(
    12
  );

  doc.setTextColor(
    ...BROWN
  );

  doc.text(
    BRAND_TAGLINE,
    pageWidth / 2,
    y,
    {
      align:
        "center",
    }
  );

  // ==========================================================
  // DIVIDER BEFORE ISSUED BY
  // ==========================================================

  y += 12;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.3
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  // ==========================================================
  // ISSUED BY
  // ==========================================================

  y += 14;

  boldFont();

  doc.setFontSize(
    11
  );

  doc.text(
    "Issued By",
    14,
    y
  );

  // ==========================================================
  // FOUNDER NAME LEFT
  // ==========================================================

  y += 8;

  boldFont();

  doc.setFontSize(
    11
  );

  doc.text(
    founderName ||
      "Manisha D Shetty",
    14,
    y
  );

  // ==========================================================
  // FSSAI NUMBER
  // ==========================================================

  y += 7;

  normalFont();

  doc.setFontSize(
    9
  );

  doc.text(
    `FSSAI License No: ${FSSAI_NUMBER}`,
    14,
    y
  );

  // ==========================================================
  // SIGNATURE RIGHT SIDE
  // ==========================================================

  const signatureY =
    y - 9;

  if (
    brilliantLoaded
  ) {
    doc.setFont(
      "Brilliant",
      "normal"
    );

    doc.setFontSize(
      16
    );

    doc.text(
      founderName ||
        "Manisha D Shetty",
      196,
      signatureY,
      {
        align:
          "right",
      }
    );
  } else {
    doc.setFont(
      "helvetica",
      "oblique"
    );

    doc.setFontSize(
      12
    );

    doc.text(
      founderName ||
        "Manisha D Shetty",
      196,
      signatureY,
      {
        align:
          "right",
      }
    );
  }

  // ==========================================================
  // SIGNATURE LINE
  // ==========================================================

  const signatureLineY =
    signatureY + 5;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.3
  );

  doc.line(
    142,
    signatureLineY,
    196,
    signatureLineY
  );

  // ==========================================================
  // FOUNDER ROLE
  // ==========================================================

  boldFont();

  doc.setFontSize(
    11
  );

  doc.text(
    "Founder",
    196,
    signatureLineY +
      8,
    {
      align:
        "right",
    }
  );

  // ==========================================================
  // BOTTOM GREEN BORDER
  // ==========================================================

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

  // ==========================================================
  // SAVE PDF
  // ==========================================================

  const filename =
    `EatOne-Invoice-${
      invoiceNo ||
      "Invoice"
    }.pdf`;

  doc.save(
    filename
  );

  return true;
}import jsPDF from "jspdf";

// ============================================================
// BRAND
// ============================================================

const BROWN = [42, 32, 22];
const GREEN = [63, 109, 62];

const BRAND_TAGLINE =
  "Healthy Delight Everyday";

const FSSAI_NUMBER =
  "21226008002884";

// ============================================================
// LOAD FILE AS BASE64
// ============================================================

async function loadFileAsBase64(
  url
) {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Could not load file: ${url}`
    );
  }

  const buffer =
    await response.arrayBuffer();

  const bytes =
    new Uint8Array(buffer);

  let binary = "";

  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {
    binary +=
      String.fromCharCode(
        bytes[i]
      );
  }

  return btoa(binary);
}

// ============================================================
// LOAD IMAGE
// ============================================================

async function loadImageAsDataURL(
  url
) {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Could not load image: ${url}`
    );
  }

  const blob =
    await response.blob();

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const reader =
        new FileReader();

      reader.onloadend =
        () =>
          resolve(
            reader.result
          );

      reader.onerror =
        reject;

      reader.readAsDataURL(
        blob
      );
    }
  );
}

// ============================================================
// FORMAT MONEY
// ============================================================

function formatMoney(
  value
) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-IN"
  );
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

  const doc =
    new jsPDF({
      orientation:
        "portrait",

      unit:
        "mm",

      format:
        "a4",
    });

  const pageWidth =
    210;

  const pageHeight =
    297;

  const safeCustomer =
    customer || {};

  const safeItems =
    Array.isArray(items)
      ? items
      : [];

  const safeTotal =
    Number(
      total || 0
    );

  // ==========================================================
  // LOAD POPPINS
  // ==========================================================

  let poppinsLoaded =
    false;

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

    poppinsLoaded =
      true;
  } catch (error) {
    console.error(
      "Poppins font failed:",
      error
    );
  }

  // ==========================================================
  // LOAD LEAGUE SPARTAN BOLD
  // ==========================================================

  let leagueSpartanLoaded =
    false;

  try {
    const spartanBase64 =
      await loadFileAsBase64(
        "/LeagueSpartan-Bold.ttf"
      );

    doc.addFileToVFS(
      "LeagueSpartan-Bold.ttf",
      spartanBase64
    );

    doc.addFont(
      "LeagueSpartan-Bold.ttf",
      "LeagueSpartan",
      "bold"
    );

    leagueSpartanLoaded =
      true;
  } catch (error) {
    console.error(
      "League Spartan font failed:",
      error
    );
  }

  // ==========================================================
  // LOAD BRILLIANT
  // ==========================================================

  let brilliantLoaded =
    false;

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

    brilliantLoaded =
      true;
  } catch (error) {
    console.error(
      "Brilliant font failed:",
      error
    );
  }

  // ==========================================================
  // FONT HELPERS
  // ==========================================================

  const normalFont =
    () => {
      if (
        poppinsLoaded
      ) {
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

  const boldFont =
    () => {
      if (
        leagueSpartanLoaded
      ) {
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

  // ==========================================================
  // TOP BROWN BORDER
  // ==========================================================

  doc.setFillColor(
    ...BROWN
  );

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
      13,
      85,
      38
    );
  } catch (error) {
    console.error(
      "Logo failed:",
      error
    );

    boldFont();

    doc.setFontSize(
      25
    );

    doc.setTextColor(
      ...BROWN
    );

    doc.text(
      "EAT ONE",
      14,
      30
    );

    normalFont();

    doc.setFontSize(
      10
    );

    doc.text(
      BRAND_TAGLINE,
      14,
      38
    );
  }

  // ==========================================================
  // DATE
  // ==========================================================

  const dateStr =
    new Date()
      .toLocaleDateString(
        "en-IN",
        {
          day:
            "2-digit",

          month:
            "long",

          year:
            "numeric",
        }
      );

  // ==========================================================
  // TOP RIGHT INFORMATION
  // ==========================================================

  boldFont();

  doc.setTextColor(
    ...BROWN
  );

  doc.setFontSize(
    11
  );

  doc.text(
    dateStr,
    196,
    20,
    {
      align:
        "right",
    }
  );

  doc.text(
    `Invoice No. ${
      invoiceNo || "-"
    }`,
    196,
    27,
    {
      align:
        "right",
    }
  );

  doc.text(
    `Status: ${
      status || "Paid"
    }`,
    196,
    34,
    {
      align:
        "right",
    }
  );

  // ==========================================================
  // FIRST DIVIDER
  // ==========================================================

  let y = 48;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.4
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 10;

  // ==========================================================
  // BILLED TO
  // ==========================================================

  boldFont();

  doc.setFontSize(
    13
  );

  doc.text(
    "Billed to:",
    14,
    y
  );

  y += 8;

  // Customer name

  normalFont();

  doc.setFontSize(
    10.5
  );

  doc.text(
    safeCustomer.name ||
      "-",
    14,
    y
  );

  y += 7;

  // ==========================================================
  // CUSTOMER ADDRESS
  // ==========================================================

  const address =
    safeCustomer.line ||
    safeCustomer.address ||
    "-";

  let fullAddress =
    address;

  if (
    safeCustomer.pincode &&
    !String(
      address
    ).includes(
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
      addressLines.length,
      1
    ) * 6;

  // ==========================================================
  // PHONE
  // ==========================================================

  let phone =
    safeCustomer.phone ||
    "-";

  if (
    phone !== "-" &&
    !String(
      phone
    ).startsWith("+")
  ) {
    phone =
      `+91 ${phone}`;
  }

  doc.text(
    phone,
    14,
    y
  );

  y += 9;

  // Customer divider

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.3
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  // ==========================================================
  // TABLE START
  // ==========================================================

  y += 20;

  // ==========================================================
  // TABLE HEADER
  // ==========================================================

  boldFont();

  doc.setFontSize(
    10
  );

  doc.setTextColor(
    ...BROWN
  );

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
    132,
    y
  );

  doc.text(
    "Amount",
    190,
    y,
    {
      align:
        "right",
    }
  );

  // Header line

  y += 5;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.35
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 9;

  // ==========================================================
  // TABLE ITEMS
  // ==========================================================

  normalFont();

  doc.setFontSize(
    9.5
  );

  safeItems.forEach(
    (row) => {
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

      const descriptionLines =
        doc.splitTextToSize(
          description,
          65
        );

      const categoryLines =
        doc.splitTextToSize(
          category,
          37
        );

      const quantityLines =
        doc.splitTextToSize(
          quantity,
          35
        );

      const lineCount =
        Math.max(
          descriptionLines.length,
          categoryLines.length,
          quantityLines.length,
          1
        );

      const rowHeight =
        Math.max(
          13,
          lineCount *
            6 +
            5
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
        132,
        y
      );

      // Amount

      const amount =
        row?.amount !==
          undefined &&
        row?.amount !==
          null
          ? `Rs. ${formatMoney(
              row.amount
            )}`
          : "-";

      doc.text(
        amount,
        190,
        y,
        {
          align:
            "right",
        }
      );

      // Move down

      y +=
        rowHeight;

      // ======================================================
      // CLEAN ROW DIVIDER
      // ======================================================

      doc.setDrawColor(
        190,
        190,
        190
      );

      doc.setLineWidth(
        0.2
      );

      doc.line(
        14,
        y - 4,
        196,
        y - 4
      );
    }
  );

  // ==========================================================
  // TOTAL
  // ==========================================================

  y += 3;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.35
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  y += 10;

  boldFont();

  doc.setFontSize(
    11
  );

  doc.text(
    "Total",
    14,
    y
  );

  doc.text(
    `Rs. ${formatMoney(
      safeTotal
    )}`,
    190,
    y,
    {
      align:
        "right",
    }
  );

  // Total bottom line

  y += 8;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.35
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  // ==========================================================
  // SHIPPING TRACKING DETAILS
  // ==========================================================

  if (
    deliveryPartner ||
    trackingId
  ) {
    y += 10;

    boldFont();

    doc.setFontSize(
      9.5
    );

    doc.text(
      "Shipping Details",
      14,
      y
    );

    y += 6;

    normalFont();

    doc.setFontSize(
      9
    );

    if (
      deliveryPartner
    ) {
      doc.text(
        `Delivery Partner: ${deliveryPartner}`,
        14,
        y
      );

      y += 6;
    }

    if (
      trackingId
    ) {
      doc.text(
        `Tracking ID: ${trackingId}`,
        14,
        y
      );

      y += 6;
    }
  }

  // ==========================================================
  // BRAND TAGLINE
  // ==========================================================

  y =
    Math.max(
      y + 20,
      195
    );

  normalFont();

  doc.setFontSize(
    12
  );

  doc.setTextColor(
    ...BROWN
  );

  doc.text(
    BRAND_TAGLINE,
    pageWidth / 2,
    y,
    {
      align:
        "center",
    }
  );

  // ==========================================================
  // DIVIDER BEFORE ISSUED BY
  // ==========================================================

  y += 12;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.3
  );

  doc.line(
    14,
    y,
    196,
    y
  );

  // ==========================================================
  // ISSUED BY
  // ==========================================================

  y += 14;

  boldFont();

  doc.setFontSize(
    11
  );

  doc.text(
    "Issued By",
    14,
    y
  );

  // ==========================================================
  // FOUNDER NAME LEFT
  // ==========================================================

  y += 8;

  boldFont();

  doc.setFontSize(
    11
  );

  doc.text(
    founderName ||
      "Manisha D Shetty",
    14,
    y
  );

  // ==========================================================
  // FSSAI NUMBER
  // ==========================================================

  y += 7;

  normalFont();

  doc.setFontSize(
    9
  );

  doc.text(
    `FSSAI License No: ${FSSAI_NUMBER}`,
    14,
    y
  );

  // ==========================================================
  // SIGNATURE RIGHT SIDE
  // ==========================================================

  const signatureY =
    y - 9;

  if (
    brilliantLoaded
  ) {
    doc.setFont(
      "Brilliant",
      "normal"
    );

    doc.setFontSize(
      16
    );

    doc.text(
      founderName ||
        "Manisha D Shetty",
      196,
      signatureY,
      {
        align:
          "right",
      }
    );
  } else {
    doc.setFont(
      "helvetica",
      "oblique"
    );

    doc.setFontSize(
      12
    );

    doc.text(
      founderName ||
        "Manisha D Shetty",
      196,
      signatureY,
      {
        align:
          "right",
      }
    );
  }

  // ==========================================================
  // SIGNATURE LINE
  // ==========================================================

  const signatureLineY =
    signatureY + 5;

  doc.setDrawColor(
    ...BROWN
  );

  doc.setLineWidth(
    0.3
  );

  doc.line(
    142,
    signatureLineY,
    196,
    signatureLineY
  );

  // ==========================================================
  // FOUNDER ROLE
  // ==========================================================

  boldFont();

  doc.setFontSize(
    11
  );

  doc.text(
    "Founder",
    196,
    signatureLineY +
      8,
    {
      align:
        "right",
    }
  );

  // ==========================================================
  // BOTTOM GREEN BORDER
  // ==========================================================

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

  // ==========================================================
  // SAVE PDF
  // ==========================================================

  const filename =
    `EatOne-Invoice-${
      invoiceNo ||
      "Invoice"
    }.pdf`;

  doc.save(
    filename
  );

  return true;
}
