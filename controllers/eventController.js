const eventModel = require("../models/eventModel");

const { processPaymentReceipt } = require("../services/receiptService");

//Create Event Controller
exports.createEvent = async (req, res) => {
  //   const {
  //     event_type,
  //     event_name,
  //     event_date_time,
  //     devotee_name,
  //     devotee_phone_number,
  //     devotee_address,
  //     amount,
  //     payment_status,
  //   } = req.body;

  //   const user_id = req.user.id;

  //   eventModel.createEvent(
  //     [
  // event_type,
  // event_name,
  // user_id,
  // event_date_time,
  // devotee_name,
  // devotee_phone_number,
  // devotee_address,
  // amount,
  // payment_status,
  //     ],
  //     (err, result) => {
  //       if (err) return res.status(500).json(err);
  //       return res
  //         .status(200)
  //         .json({ message: "Event Added Successfully", value: result });
  //     },
  //   );

  const {
    event_type,
    event_name,
    event_date_time,
    devotee_name,
    devotee_phone_number,
    devotee_address,
    amount,
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

  const user_id = req.user.id;

  eventModel.createEvent(
    {
      event_type,
      event_name,
      user_id,
      event_date_time,
      devotee_name,
      devotee_phone_number,
      devotee_address,
      amount,
      payment_status,
      mode,

      transaction_id: transaction_id ?? null,

      reference_number: reference_number ?? null,

      current_user_id: user_id,
    },

    (err, result) => {
      if (err) {
        console.error("Event payment failed:", err);

        return res.status(500).json({
          success: false,

          message: err.message || "Failed to create Event payment",
        });
      }

      /*
      ==================================================
      PAYMENT SUCCESS
      ==================================================
      */

      res.status(200).json({
        success: true,

        message: "Event payment successful",

        data: {
          eventPaymentId: result.eventPaymentId,

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

//Get Events By Date Controller
exports.getEventsByDate = async (req, res) => {
  const { date } = req.query;

  eventModel.getEventsByDate(date, (err, result) => {
    if (err) return res.status(500).json(err);
    return res
      .status(200)
      .json({ message: "Events retrieved successfully", value: result });
  });
};

//Get Events By Date Time
exports.getEventsByDateTime = async (req, res) => {
  const { dateTime } = req.query;
  eventModel.getEventsByDateTime(dateTime, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Fetching Events By Date Time Failed", err });
    }
    return res
      .status(200)
      .json({ message: "Events retrieved successfully", value: result });
  });
};

//Get the Event Booked Slots By Date
exports.getEventBookedSlotsByDate = async (req, res) => {
  const { date } = req.query;
  eventModel.getEventBookedSlotsByDate(date, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Fetching Booking Slot Failed", err });
    }
    return res
      .status(200)
      .json({ message: "Booking Slot Fetched Successfully", value: result });
  });
};
