const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

async function generateDonationReceipt(data) {
  const pdfDoc = await PDFDocument.create();

  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.addPage([595.28, 841.89]);

  const { width, height } = page.getSize();

  const regularFont = await pdfDoc.embedFont(
    fs.readFileSync("./fonts/NotoSans-Regular.ttf"),
  );

  const boldFont = await pdfDoc.embedFont(
    fs.readFileSync("./fonts/NotoSans-Bold.ttf"),
  );

  const gold = rgb(0.85, 0.55, 0.1);

  const black = rgb(0, 0, 0);

  const white = rgb(1, 1, 1);

  const lightGold = rgb(0.95, 0.9, 0.75);

  /*
        PAGE BORDER
  */

  page.drawRectangle({
    x: 20,

    y: 20,

    width: width - 40,

    height: height - 40,

    borderColor: gold,

    borderWidth: 2,
  });

  /*
        HEADER
  */

  page.drawRectangle({
    x: 25,

    y: height - 150,

    width: width - 50,

    height: 120,

    color: gold,
  });

  // LOGO

  try {
    const logoPath = path.join(__dirname, "../assets/logo.png");

    const logoBytes = fs.readFileSync(logoPath);

    const logo = await pdfDoc.embedPng(logoBytes);

    const logoWidth = 90;

    const logoHeight = 120;

    page.drawImage(logo, {
      x: 55,

      // move inside header container
      y: height - 150,

      width: logoWidth,

      height: logoHeight,
    });
  } catch (error) {
    console.log("Logo Error:", error.message);
  }

  /*
      CENTER HEADER TEXT
*/

  function drawCenteredText(text, y, size, font) {
    const textWidth = font.widthOfTextAtSize(text, size);

    page.drawText(text, {
      x: (width - textWidth) / 2,

      y: y,

      size: size,

      font: font,

      color: white,
    });
  }

  drawCenteredText("NAMMA KOVIL", height - 70, 28, boldFont);

  drawCenteredText("Temple Donation Receipt", height - 98, 15, regularFont);

  drawCenteredText(
    "Service to God is Service to Humanity",
    height - 125,
    11,
    regularFont,
  );

  let y = height - 185;

  /*
       HELPER FUNCTIONS
  */

  function drawRow(label, value) {
    page.drawText(label, {
      x: 60,

      y,

      size: 11,

      font: boldFont,

      color: black,
    });

    page.drawText(String(value ?? ""), {
      x: 200,

      y,

      size: 11,

      font: regularFont,

      color: black,
    });

    y -= 22;
  }

  function section(title) {
    y -= 5;

    page.drawRectangle({
      x: 50,

      y: y - 5,

      width: 495,

      height: 25,

      color: lightGold,
    });

    page.drawText(title, {
      x: 65,

      y: y + 3,

      size: 12,

      font: boldFont,
    });

    y -= 35;
  }

  /*
        RECEIPT INFORMATION
  */

  drawRow("Receipt No :", data.receiptNo);

  drawRow("Date :", data.date);

  drawRow("Time :", data.time);

  drawRow("Status :", "PAID");

  /*
        DONOR INFORMATION
  */

  section("DONOR INFORMATION");

  drawRow("Name :", data.donor.name);

  drawRow("Mobile :", data.donor.mobile);

  drawRow("Address :", data.donor.address);

  /*
        DONATION DETAILS
  */

  section("DONATION DETAILS");

  drawRow("Scheme :", data.donation.scheme);

  drawRow("Assigned Amount :", data.donation.assigned);

  drawRow("Paid Amount :", data.donation.paid);

  drawRow("Pending Amount :", data.donation.pending);

  /*
        TOTAL RECEIVED BOX
  */

  y -= 5;

  page.drawRectangle({
    x: 110,

    y: y - 65,

    width: 375,

    height: 70,

    borderColor: gold,

    borderWidth: 2,
  });

  page.drawText("TOTAL RECEIVED", {
    x: 220,

    y: y - 25,

    size: 14,

    font: boldFont,
  });

  page.drawText(data.donation.paid, {
    x: 255,

    y: y - 55,

    size: 22,

    font: boldFont,

    color: gold,
  });

  y -= 100;

  /*
        PAYMENT DETAILS
  */

  section("PAYMENT DETAILS");

  drawRow("Payment Mode :", data.payment.mode);

  drawRow("Transaction ID :", data.payment.transactionId);

  drawRow("Reference No :", data.payment.referenceNo);

  /*
        QR CODE - BOTTOM RIGHT
  */

  const qrData = await QRCode.toDataURL(data.verifyUrl);

  const qrBytes = Buffer.from(qrData.split(",")[1], "base64");

  const qrImage = await pdfDoc.embedPng(qrBytes);

  const qrSize = 100;

  // bottom right inside border

  const qrX = width - 155;

  const qrY = 60;

  page.drawRectangle({
    x: qrX - 10,

    y: qrY - 10,

    width: 120,

    height: 125,

    borderColor: gold,

    borderWidth: 1,
  });

  page.drawImage(qrImage, {
    x: qrX,

    y: qrY + 10,

    width: qrSize,

    height: qrSize,
  });

  page.drawText("Scan to Verify", {
    x: qrX + 10,

    y: qrY - 5,

    size: 10,

    font: boldFont,
  });

  /*
        SIGNATURE AREA
  */

  page.drawText("Received By", {
    x: 60,

    y: 110,

    size: 12,

    font: boldFont,
  });

  page.drawLine({
    start: {
      x: 60,
      y: 90,
    },

    end: {
      x: 220,
      y: 90,
    },

    thickness: 1,
  });

  page.drawText("Temple Administrator", {
    x: 70,

    y: 70,

    size: 11,

    font: regularFont,
  });

  page.drawText(`Name : ${data.receivedBy.name}`, {
    x: 60,

    y: 50,

    size: 10,

    font: regularFont,
  });

  /*
        FOOTER
  */

  page.drawText("May Lord Bless You & Your Family", {
    x: 150,

    y: 32,

    size: 11,

    font: boldFont,
  });

  /*
        SAVE PDF
  */

  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
}

module.exports = generateDonationReceipt;
