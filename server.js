const express = require("express");

const cors = require("cors");

require("dotenv").config();

require("./config/db");

const app = express();

const userRouter = require("./routes/userRoutes");

const eventRouter = require("./routes/eventRoutes");

const festivalRouter = require("./routes/festivalRoutes");

const donationSchemeRouter = require("./routes/donationSchemeRoutes");

const festivalPaymentRouter = require("./routes/festivalPaymentRoutes");

const donationSchemePaymentRouter = require("./routes/donationSchemePaymentRoutes");

app.use(cors());

app.use(express.json());

//User Route
app.use("/api/users", userRouter);

//Event Route
app.use("/api/events", eventRouter);

//Festival Route
app.use("/api/festivals", festivalRouter);

//Donation Scheme Route
app.use("/api/donation-schemes", donationSchemeRouter);

//Festival Payment Route
app.use("/api/festival-payments", festivalPaymentRouter);

//Donation Scheme Payment Route
app.use("/api/donation-scheme-payments", donationSchemePaymentRouter);

const generateReceipt = require("./utils/generateReceipt");

const { sendWhatsappPDF } = require("./utils/whatsapp");

const fs = require("fs");

async function handleSendWhatsAppPdf() {
  const paymentData = {
    receiptNo: "NK-2026-000123",

    date: "19-Jul-2026",

    time: "10:45 AM",

    donor: {
      name: "Inish Raj",

      mobile: "+91 9500462466",

      address: "Chennai",
    },

    donation: {
      scheme: "Annadhanam",

      assigned: "₹1000",

      paid: "₹1000",

      pending: "₹0",
    },

    payment: {
      mode: "Google Pay",

      transactionId: "TXN67363826",

      referenceNo: "REF83726373",
    },

    receivedBy: {
      name: "Mr. Suresh Kumar",
    },

    verifyUrl: "https://nammakovil.com/verify/NK-2026-000123",
  };

  // 2. Generate PDF

  const pdfBuffer = await generateReceipt(paymentData);

  console.log("PDF Generated");

  // fs.writeFileSync("test_receipt.pdf", pdfBuffer);

  // 3. Send PDF to WhatsApp

  await sendWhatsappPDF("916382989568", pdfBuffer);

  console.log("WhatsApp Sent");
}

// handleSendWhatsAppPdf();

//Server connection
app.listen(process.env.PORT, () => {
  console.log(`Server is Running on Port ${process.env.PORT}`);
});
