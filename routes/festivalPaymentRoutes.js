const express = require("express");

const router = express.Router();

const festivalPaymentController = require("../controllers/festivalPaymentController");

const verifyToken = require("../middleware/authMiddleware");

// Create Festival Payment Route
router.post(
  "/festival-payment",
  verifyToken,
  festivalPaymentController.createFestivalPayment,
);

//Get Festival Payment Details by Festival id
router.get(
  "/festival/:festivalId",
  verifyToken,
  festivalPaymentController.getFestivalPaymentDetailsByFestivalId,
);

//Get Users Festival Payment Details By Festival Id
router.get(
  "/festival/:festivalId/users",
  verifyToken,
  festivalPaymentController.getUsersFestivalPaymentDetailsByFestivalId,
);

//Get User Festival Contribution
router.get(
  "/festivals/contribution-summary",
  verifyToken,
  festivalPaymentController.getUserFestivalContributionByUserIdAndFestivalId,
);

//Update Festival Payment
router.put(
  "/update-festival-payment",
  verifyToken,
  festivalPaymentController.updateFestivalPaymentByUserIdAndFestivalId,
);

module.exports = router;
