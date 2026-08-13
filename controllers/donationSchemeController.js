const donationSchemeModel = require("../models/donationSchemeModel");

//Create Donation Scheme Controller
exports.createDontaionScheme = async (req, res) => {
  const { scheme_name, description, target_amount } = req.body;
  donationSchemeModel.createDonationScheme(
    [scheme_name, description, target_amount],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Donation Scheme Creation Failed" });
      }
      return res.status(200).json({
        message: "Donation Scheme Created Successfully",
        value: result,
      });
    },
  );
};

//Get all Schemes Controller
exports.getAllSchemsController = async (req, res) => {
  donationSchemeModel.getAllSchemesModel((err, result) => {
    if (err) {
      return res.status(500).json({ message: "Get All Schemes Failed", err });
    }
    return res
      .status(200)
      .json({ message: "Successfully Fetched All Schemes", value: result });
  });
};

//Get Donation Scheme Payment Dashboard Details
exports.getDonationSchemePaymentDashboardDetailsController = async (
  req,
  res,
) => {
  donationSchemeModel.getDonationSchemePaymentDashboardDetailsModel(
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Get Donation Schemes Payment Dashboard Details Failed",
          err,
        });
      }
      return res.status(200).json({
        message:
          "Successfully fetched donation scheme payment dashboaed details",
        value: result[0],
      });
    },
  );
};

//Get All Donation Scheme Payement Details
exports.getAllDonationSchemePaymentDetailsController = async (req, res) => {
  donationSchemeModel.getAllDonationSchemePaymentDetailsModel((err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Get All Donation Scheme Payment Details Failed",
        err,
      });
    }
    return res.status(200).json({
      message: "Successfully fetched all donation scheme payment details",
      value: result,
    });
  });
};

//Get Donation Scheme Details
exports.getDonationSchemeDetailsController = async (req, res) => {
  const { schemeId } = req.params;
  donationSchemeModel.getDonationSchemeDetailsModel(schemeId, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Get Donation Scheme Details Failed", err });
    }
    return res.status(200).json({
      message: "Successfully fetched donation scheme details",
      value: result[0] ?? {},
    });
  });
};

//Get Members Scheme Details
exports.getMembersSchemeDetailsController = async (req, res) => {
  const { schemeId } = req.params;
  donationSchemeModel.getMembersSchemeDetailsModel(schemeId, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Get Members Scheme Details Failed", err });
    }
    return res.status(200).json({
      message: "Successfully fetched members scheme details",
      value: result,
    });
  });
};
