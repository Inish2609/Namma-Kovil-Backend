const express = require("express");

const router = express.Router();

const donationSchemePaymentController = require("../controllers/donationSchemePaymentController");

const verifyToken = require("../middleware/authMiddleware");

//Create Donation Scheme Payment Route
router.post(
  "/create-donation-scheme-payment",
  verifyToken,
  donationSchemePaymentController.createDonationSchemePayment,
);

//Get User Scheme Payment Details By User id and Scheme Id Route
router.get(
  "/user-summary",
  verifyToken,
  donationSchemePaymentController.getUserSchemePaymentDetailsByUserIdAndSchemeIdController,
);

//Update Donation Scheme Paid Amount
router.put(
  "/update-paid-amount",
  verifyToken,
  donationSchemePaymentController.updateAmountPaidByUserForSchemeController,
);

//Get Scheme Donation Summary Details
router.get(
  "/:schemeId/assignment-summary",
  verifyToken,
  donationSchemePaymentController.getSchemeDonationAssignmentSummayDetailsController,
);

//Check Donation Scheme Assigned to this User
router.get(
  "/check",
  verifyToken,
  donationSchemePaymentController.checkDonationSchemeAssignedController,
);

module.exports = router;
