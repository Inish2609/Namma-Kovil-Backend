const express = require("express");

const eventController = require("../controllers/eventController");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

//Create Event Route
router.post("/create-event", verifyToken, eventController.createEvent);

//Get Events By Date Route
router.get("/get-events-by-date", verifyToken, eventController.getEventsByDate);

//Get Events By Date Time Route
router.get(
  "/get-events-by-date-time",
  verifyToken,
  eventController.getEventsByDateTime,
);

//Get Event Booked Slot By Date
router.get(
  "/booked-slots",
  verifyToken,
  eventController.getEventBookedSlotsByDate,
);

module.exports = router;
