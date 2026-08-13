const express = require("express");

const router = express.Router();

const festivalController = require("../controllers/festivalController");

const verifyToken = require("../middleware/authMiddleware");

//Create Festival Route
router.post("/create-festival", verifyToken, festivalController.createFestival);

//Get Upcoming Festivals
router.get(
  "/upcoming-festivals",
  verifyToken,
  festivalController.getUpcomingFestivals,
);

//Get Festival Dashboard Details Route
router.get(
  "/get-festival-dashboard-details",
  verifyToken,
  festivalController.getFestivalDashBoardDetails,
);

//Get User Festivals Summary By User Id Route
router.get(
  "/users/:userId/festival-summary",
  verifyToken,
  festivalController.getUserFestivalSummaryByUserId,
);

//Get User Festivals Contributions By user Id
router.get(
  "/users/:userId/festival-contributions",
  verifyToken,
  festivalController.getUserFestivalsContributionsByUserId,
);

//Get All Festivals
router.get("/", verifyToken, festivalController.getAllFestivals);

module.exports = router;
