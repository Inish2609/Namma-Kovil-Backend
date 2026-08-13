const paymentHistoryModel = require("../models/paymentHistoryModel");

//Create Payment History Controller
exports.createPaymentHistory = (req, res) => {
  const {
    user_id,
    received_by,
    donation_scheme_id,
    festival_id,
    event_id,
    receipt_number,
    type,
    amount,
    mode,
    transaction_id,
    reference_number,
  } = req.body;
  paymentHistoryModel.createPaymentHistory(
    [
      user_id,
      received_by,
      donation_scheme_id,
      festival_id,
      event_id,
      receipt_number,
      type,
      amount,
      mode,
      transaction_id,
      reference_number,
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating payment history: ", err);
        return res
          .status(500)
          .json({ error: "Failed to create payment history" });
      } else {
        return res.status(200).json({
          message: "Payment history created successfully",
          value: result,
        });
      }
    },
  );
};
