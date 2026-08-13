const festivalModel = require("../models/festivalModel");

//Create Festival Controller
exports.createFestival = (req, res) => {
  const { festival_name, amount, description, start_date, end_date } = req.body;
  festivalModel.createFestival(
    [festival_name, amount, description, start_date, end_date],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Festival Creation Failed" });
      }
      return res
        .status(200)
        .json({ message: "Festival Created Successfully", value: result });
    },
  );
};

//Get Upcoming Festivals Controller
exports.getUpcomingFestivals = async (req, res) => {
  festivalModel.getUpcomingFestivals((err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ messgae: "Fetching Upcoming Festival Failed" });
    }
    return res
      .status(200)
      .json({ message: "Festivals retrieved successfully", value: result });
  });
};

//Get Festival DashBoard Details Controller
exports.getFestivalDashBoardDetails = async (req, res) => {
  festivalModel.getFestivalDashBoardDetails((err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Get Festival DashBoard Details Failed", err });
    }
    return res.status(200).json({
      message: "Successfully Fetched Festival DashBoard Details",
      value: result,
    });
  });
};

//Get User Festivals Summary By User Id
exports.getUserFestivalSummaryByUserId = async (req, res) => {
  const { userId } = req.params;
  festivalModel.getUserFestivalSummaryByUserId(userId, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Get User Festivals Summary Failed", err });
    }
    return res.status(200).json({
      message: "Successfully Fetched User Festivals Summary",
      value: result[0],
    });
  });
};

//Get User Festivals Contribution By User Id
exports.getUserFestivalsContributionsByUserId = async (req, res) => {
  const { userId } = req.params;
  festivalModel.getUserFestivalsContributions(userId, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Get User Festivals Contributions Failed!!", err });
    }
    return res.status(200).json({
      message: "Successfully Fetched User Festival Contributions",
      value: result,
    });
  });
};

//Get All Festivals
exports.getAllFestivals = async (req, res) => {
  festivalModel.getAllFestivals((err, result) => {
    if (err) {
      return res.status(500).json({ messgae: "Get All Festival Failed", err });
    }
    return res
      .status(200)
      .json({ message: "Successfully Fetched All Festivals", value: result });
  });
};
