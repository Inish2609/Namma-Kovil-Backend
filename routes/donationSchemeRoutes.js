const express = require("express");

const donationSchemeController = require("../controllers/donationSchemeController");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

//Create Donation Scheme Route
router.post(
  "/create-donation-scheme",
  verifyToken,
  donationSchemeController.createDontaionScheme,
);

//Get All Schemes Routes
router.get(
  "/get-all-donation-schemes",
  verifyToken,
  donationSchemeController.getAllSchemsController,
);

//Get Donation Scheme Payment Dashboard Details
router.get(
  "/payment-dashboard-details",
  verifyToken,
  donationSchemeController.getDonationSchemePaymentDashboardDetailsController,
);

//Get All Donation Scheme Payment Details Route
router.get(
  "/all-donation-scheme-payment-details",
  verifyToken,
  donationSchemeController.getAllDonationSchemePaymentDetailsController,
);

//Get Donation Scheme Details Router
router.get(
  "/:schemeId/details",
  verifyToken,
  donationSchemeController.getDonationSchemeDetailsController,
);

//Get Members Scheme Details Router
router.get(
  "/:schemeId/members",
  verifyToken,
  donationSchemeController.getMembersSchemeDetailsController,
);

module.exports = router;
