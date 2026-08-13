const festivalPaymentModel = require("../models/festivalPaymentModel");

const { processPaymentReceipt } = require("../services/receiptService");

//Create Festival Payment Controller
exports.createFestivalPayment = (req, res) => {
  // const { user_id, festival_id, amount_paid, payment_status } = req.body;
  // festivalPaymentModel.createFestivalPayment(
  //   [user_id, festival_id, amount_paid, payment_status],
  //   (err, result) => {
  //     if (err) {
  //       console.error("Error creating festival payment: ", err);
  //       return res
  //         .status(500)
  //         .json({ error: "Failed to create festival payment" });
  //     } else {
  //       return res.status(200).json({
  //         message: "Festival payment created successfully",
  //         value: result,
  //       });
  //     }
  //   },
  // );

  const {
    user_id,
    festival_id,
    amount_paid,
    payment_status,
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

  /*
  =======================================================
  CREATE PAYMENT
  =======================================================
  */

  festivalPaymentModel.createFestivalPayment(
    {
      user_id,
      festival_id,
      amount_paid,
      payment_status,
      mode,
      transaction_id: transaction_id ?? null,
      reference_number: reference_number ?? null,
      current_user_id: currentUserId,
    },
    (err, result) => {
      if (err) {
        console.error("Error creating festival payment: ", err);

        return res.status(500).json({
          success: false,

          message: err.message || "Failed to create festival payment",
        });
      }

      /*
      ==================================================
      PAYMENT SUCCESS
      ==================================================
      */

      res.status(200).json({
        success: true,

        message: "Festival payment created successfully",

        data: {
          festivalPaymentId: result?.festivalPaymentId,

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

//Get Festival Payment Details By Festival Id
exports.getFestivalPaymentDetailsByFestivalId = async (req, res) => {
  const { festivalId } = req.params;
  festivalPaymentModel.getFestivalPaymentDetailsById(
    festivalId,
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Get Festival Payment Details Failed", err });
      }
      return res.status(200).json({
        message: "Successfully Fetched Festival Payment Details By Festival Id",
        value: result[0],
      });
    },
  );
};

//Get Users Festival Payment Details By Festival Id
exports.getUsersFestivalPaymentDetailsByFestivalId = async (req, res) => {
  const { festivalId } = req.params;
  festivalPaymentModel.getUsersFestivalPaymentDetailsByFestivalId(
    festivalId,
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Get Users Festival Payment Details Failed", err });
      }
      return res.status(200).json({
        message:
          "Successfully Fetched Users Festival Payment Details By Festival Id",
        value: result,
      });
    },
  );
};

//Get User Festival Contribution By User Id and Festival Id
exports.getUserFestivalContributionByUserIdAndFestivalId = async (req, res) => {
  const { festivalId, userId } = req.query;
  festivalPaymentModel.getUserFestivalContributionByUserIdAndFestivalId(
    [festivalId, userId],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Get User Festival Contribution Failed!!" });
      }
      return res.status(200).json({
        message: "Successfully Fetched User Festival Contributions",
        value: result[0],
      });
    },
  );
};

//Update Festival Payments By User Id and Festival Id
exports.updateFestivalPaymentByUserIdAndFestivalId = async (req, res) => {
  // const { amount_paid, payment_status, user_id, festival_id } = req.body;
  // festivalPaymentModel.updateFestivalPaymentByUserIdAndFestivalId(
  //   [amount_paid, payment_status, user_id, festival_id],
  //   (err, result) => {
  //     if (err) {
  //       return res
  //         .status(500)
  //         .json({ message: "Update Festival Payment Failed", err });
  //     }
  //     return res.status(200).json({
  //       message: "Successfully Updated Festival Payment",
  //       value: result,
  //     });
  //   },
  // );

  const {
    amount_paid,
    payment_status,
    user_id,
    festival_id,
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

  festivalPaymentModel.updateFestivalPaymentByUserIdAndFestivalId(
    {
      amount_paid,
      payment_status,
      user_id,
      festival_id,
      mode,
      transaction_id: transaction_id ?? null,
      reference_number: reference_number ?? null,
      current_user_id: currentUserId,
    },
    (err, result) => {
      if (err) {
        console.error("Festival payment failed:", err);

        return res.status(500).json({
          success: false,

          message: err.message || "Failed to create festivak payment",
        });
      }

      /*
      ==================================================
      PAYMENT SUCCESS
      ==================================================
      */

      res.status(200).json({
        success: true,

        message: "Festival payment successful",

        data: {
          festivalPaymentId: result.festivalPaymentId,

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
