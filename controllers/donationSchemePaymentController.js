const donationSchemePaymentModel = require("../models/donationSchemePayment");

const { processPaymentReceipt } = require("../services/receiptService");

//Create Donation Scheme Payment Controller
exports.createDonationSchemePayment = (req, res) => {
  const {
    user_id,
    donation_scheme_id,
    amount_paid,
    amount_assigned,
    payment_status,
  } = req.body;

  donationSchemePaymentModel.createDonationSchemePayment(
    {
      user_id,
      donation_scheme_id,
      amount_paid: amount_paid ?? 0,
      amount_assigned: amount_assigned ?? 0,
      payment_status: payment_status ?? "pending",
    },
    (err, result) => {
      if (err) {
        console.error("Error creating donation scheme payment: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      return res.status(200).json({
        message: "Donation scheme payment created successfully",
        value: result,
      });
    },
  );
};

//Get User Scheme Payment Details By User id and Scheme id Controller
exports.getUserSchemePaymentDetailsByUserIdAndSchemeIdController = async (
  req,
  res,
) => {
  const { userId, schemeId } = req.query;
  donationSchemePaymentModel.getUserSchemePaymentDetailsByUserIdAndSchemeIdModel(
    [userId, schemeId],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Get User Scheme Payment Details Failed", err });
      }
      return res.status(200).json({
        message: "Successfully fetched User Scheme Payment Details",
        value: result[0] ?? {},
      });
    },
  );
};

//Update the Amount Paid By the User to the Scheme
exports.updateAmountPaidByUserForSchemeController = async (req, res) => {
  // const { amount_paid, userId, schemeId,  } = req.body;
  // donationSchemePaymentModel.updateAmountPaidByUserForSchemeModel(
  //   [amount_paid, amount_paid, userId, schemeId],
  //   (err, result) => {
  //     if (err) {
  //       return res
  //         .status(500)
  //         .json({ message: "Update User Donotion Paid Amount Failed", err });
  //     }
  //     return res.status(200).json({
  //       message: "Successfully Updated User Donation Scheme Paid Amount",
  //       value: result,
  //     });
  //   },
  // );

  const {
    amount_paid,
    userId,
    schemeId,
    mode,
    transaction_id,
    reference_number,
  } = req.body;

  /*
  =======================================================
  CURRENT LOGGED-IN USER
  =======================================================
  */

  /*
  Assuming your JWT middleware puts the
  logged-in user inside req.user.
  */

  const currentUserId = req.user.id;

  donationSchemePaymentModel.updateAmountPaidByUserForSchemeModel(
    {
      amount_paid,
      amount_paid,
      userId,
      schemeId,
      mode,
      transaction_id: transaction_id ?? null,
      reference_number: reference_number ?? null,
      current_user_id: currentUserId,
    },
    (err, result) => {
      if (err) {
        console.error("Donation payment failed:", err);

        return res.status(500).json({
          success: false,

          message: err.message || "Failed to Update donation payment",
        });
      }

      /*
      ==================================================
      PAYMENT SUCCESS
      ==================================================
      */

      res.status(200).json({
        success: true,

        message: "Donation payment successful",

        data: {
          donationPaymentId: result.donationPaymentId,

          paymentHistoryId: result.paymentHistoryId,

          receiptNumber: result.receiptNumber,
        },
      });

      /*
      ==================================================
      PROCESS RECEIPT
      ==================================================
      *
      * Do not make the user wait for:
      *
      * PDF generation
      * WhatsApp API
      *
      */

      processPaymentReceipt(result.paymentHistoryId);
    },
  );
};

//Get Scheme Donation Assignment Summary
exports.getSchemeDonationAssignmentSummayDetailsController = async (
  req,
  res,
) => {
  const { schemeId } = req.params;
  donationSchemePaymentModel.getSchemeDonationAssignmentSummayDetailsModel(
    schemeId,
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Get scheme donation assignment details failed",
          err,
        });
      }
      return res.status(200).json({
        message: "Successfully fetched scheme donation assignment details",
        value: result[0],
      });
    },
  );
};

//Check Donation Scheme Assigned to this User
exports.checkDonationSchemeAssignedController = async (req, res) => {
  const { userId, schemeId } = req.query;
  donationSchemePaymentModel.checkDonationSchemeAssignedModel(
    [userId, schemeId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to check donation scheme assignment",
          value: false,
        });
      }
      return res.status(200).json({
        message: "Donation scheme assignment checked successfully",
        value: result[0].is_assigned === 1,
      });
    },
  );
};
