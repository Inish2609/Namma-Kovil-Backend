const paymentHistoryModel = require("../models/paymentHistoryModel");

const { prepareReceiptData } = require("../utils/receiptHelper");

const generateReceipt = require("../utils/generateReceipt");

const { sendWhatsappPDF } = require("../utils/whatsapp");

/*
=========================================================
PROCESS RECEIPT
=========================================================
*/

exports.processPaymentReceipt = (paymentHistoryId) => {
  return new Promise((resolve) => {
    /*
    ================================================
    1. GET PAYMENT DETAILS
    ================================================
    */

    paymentHistoryModel.getPaymentReceiptDetails(
      paymentHistoryId,

      async (err, rows) => {
        if (err) {
          console.error("Get receipt details failed:", err);

          return resolve();
        }

        if (!rows || !rows.length) {
          console.error("Payment history not found:", paymentHistoryId);

          return resolve();
        }

        const payment = rows[0];

        console.log(payment)

        try {
          /*
          ==========================================
          2. PREPARE RECEIPT DATA
          ==========================================
          */

          const receiptData = prepareReceiptData(payment);

          console.log("Receipt data prepared:", receiptData.receiptNo);

          /*
          ==========================================
          3. GENERATE PDF
          ==========================================
          */

          const pdfBuffer = await generateReceipt(receiptData);

          console.log("Receipt PDF generated:", receiptData.receiptNo);

          /*
          ==========================================
          4. SEND WHATSAPP
          ==========================================
          */

          await sendWhatsappPDF(
            919500462466 ?? payment.donor_mobile,
            pdfBuffer,
            receiptData?.donor?.name,
            payment?.paid_amount,
            receiptData?.donation?.scheme,
          );

          console.log("WhatsApp sent:", receiptData.receiptNo);

          /*
          ==========================================
          5. UPDATE WHATSAPP STATUS
          ==========================================
          */

          paymentHistoryModel.updateWhatsappStatus(
            paymentHistoryId,

            "SENT",

            (statusError) => {
              if (statusError) {
                console.error("WhatsApp status update failed:", statusError);
              }

              resolve();
            },
          );
        } catch (error) {
          console.error("Receipt processing failed:", error);

          /*
          ==========================================
          WHATSAPP FAILED
          ==========================================
          */

          paymentHistoryModel.updateWhatsappStatus(
            paymentHistoryId,

            "FAILED",

            (statusError) => {
              if (statusError) {
                console.error("Failed to update WhatsApp status:", statusError);
              }

              resolve();
            },
          );
        }
      },
    );
  });
};
