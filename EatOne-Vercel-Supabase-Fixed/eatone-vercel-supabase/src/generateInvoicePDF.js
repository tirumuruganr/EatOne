// ============================================================
// TABLE
// ============================================================

// Start table
y += 18;

// ------------------------------------------------------------
// HEADER
// ------------------------------------------------------------

doc.setFont(
  leagueSpartanLoaded ? "LeagueSpartan" : "helvetica",
  leagueSpartanLoaded ? "bold" : "bold"
);

doc.setFontSize(10);
doc.setTextColor(...BROWN);

doc.text("Description", 14, y);
doc.text("Category", 88, y);
doc.text("Quantity", 132, y);

doc.text(
  "Amount",
  190,
  y,
  { align: "right" }
);

// Header bottom line
y += 5;

doc.setDrawColor(...BROWN);
doc.setLineWidth(0.35);

doc.line(
  14,
  y,
  196,
  y
);

y += 9;

// ------------------------------------------------------------
// ITEMS
// ------------------------------------------------------------

doc.setFont(
  poppinsLoaded ? "Poppins" : "helvetica",
  "normal"
);

doc.setFontSize(9.5);

safeItems.forEach((row) => {

  const description =
    row?.description || "-";

  const category =
    row?.category || "-";

  const quantity =
    String(row?.quantity || "-");

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

  // Determine row height BEFORE drawing
  const numberOfLines =
    Math.max(
      descriptionLines.length,
      categoryLines.length,
      quantityLines.length,
      1
    );

  const rowHeight =
    Math.max(
      12,
      numberOfLines * 6 + 5
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
    row?.amount !== undefined &&
    row?.amount !== null
      ? `Rs. ${Number(
          row.amount
        ).toLocaleString("en-IN")}`
      : "-";

  doc.text(
    amount,
    190,
    y,
    {
      align: "right"
    }
  );

  // Move to bottom of row
  y += rowHeight;

  // Light separator
  doc.setDrawColor(
    190,
    190,
    190
  );

  doc.setLineWidth(0.2);

  doc.line(
    14,
    y - 4,
    196,
    y - 4
  );
});

// ------------------------------------------------------------
// TOTAL
// ------------------------------------------------------------

// Space after last row
y += 3;

doc.setDrawColor(...BROWN);
doc.setLineWidth(0.35);

// Main line before total
doc.line(
  14,
  y,
  196,
  y
);

y += 10;

doc.setFont(
  leagueSpartanLoaded
    ? "LeagueSpartan"
    : "helvetica",
  "bold"
);

doc.setFontSize(11);

doc.text(
  "Total",
  14,
  y
);

doc.text(
  `Rs. ${Number(
    safeTotal
  ).toLocaleString("en-IN")}`,
  190,
  y,
  {
    align: "right"
  }
);

// Bottom total line
y += 8;

doc.setDrawColor(...BROWN);
doc.setLineWidth(0.35);

doc.line(
  14,
  y,
  196,
  y
);
