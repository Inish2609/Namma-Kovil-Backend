const db = require("../config/db");

//Creation Donation Scheme Model
exports.createDonationScheme = (data, callback) => {
  const query =
    "INSERT INTO donation_schemes (scheme_name, description, target_amount) VALUES (?, ?, ?)";
  db.query(query, data, callback);
};

//Get All Schemes Model
exports.getAllSchemesModel = (callback) => {
  const query = `SELECT * FROM donation_schemes`;
  db.query(query, callback);
};

//Get Donation Scheme Payment Dashboard Details
exports.getDonationSchemePaymentDashboardDetailsModel = (callback) => {
  const query = `
    SELECT
        COUNT(ds.id) AS total_schemes,

        COALESCE(SUM(ds.target_amount), 0) AS total_target_amount,

        COALESCE(SUM(dsp.amount_paid), 0) AS total_collected_amount,

        COALESCE(SUM(ds.target_amount), 0) -
        COALESCE(SUM(dsp.amount_paid), 0) AS total_pending_amount,

        COUNT(DISTINCT dsp.user_id) AS total_donors,

        ROUND(
            CASE
                WHEN COALESCE(SUM(ds.target_amount), 0) = 0 THEN 0
                ELSE (
                    COALESCE(SUM(dsp.amount_paid), 0) /
                    COALESCE(SUM(ds.target_amount), 0)
                ) * 100
            END,
            2
        ) AS collection_percentage

    FROM donation_schemes ds
    LEFT JOIN donation_scheme_payments dsp
        ON dsp.donation_scheme_id = ds.id;
  `;

  db.query(query, callback);
};

//Get All Donation Scheme Payement Details
exports.getAllDonationSchemePaymentDetailsModel = (callback) => {
  const query = `SELECT
    ds.id,
    ds.scheme_name,
    ds.description,
    ds.target_amount,

    COALESCE(SUM(dsp.amount_paid),0) AS collected_amount,

    ds.target_amount - COALESCE(SUM(dsp.amount_paid),0) AS pending_amount,

    ROUND(
        (COALESCE(SUM(dsp.amount_paid),0) / ds.target_amount) * 100,
        0
    ) AS progress,

    COUNT(DISTINCT dsp.user_id) AS total_donors

FROM donation_schemes ds

LEFT JOIN donation_scheme_payments dsp
ON dsp.donation_scheme_id = ds.id
GROUP BY
    ds.id,
    ds.scheme_name,
    ds.description,
    ds.target_amount

ORDER BY ds.created_at DESC;`;

  db.query(query, callback);
};

//Get Donation Scheme Details
exports.getDonationSchemeDetailsModel = (id, callback) => {
  const query = `SELECT
    ds.id AS scheme_id,
    ds.scheme_name,
    ds.description,

    COALESCE(SUM(dsp.amount_assigned),0) AS target_amount,

    COALESCE(SUM(dsp.amount_paid),0) AS collected_amount,

    COALESCE(SUM(dsp.amount_assigned - dsp.amount_paid),0) AS pending_amount,

    ROUND(
        CASE
            WHEN SUM(dsp.amount_assigned)=0 THEN 0
            ELSE
                (SUM(dsp.amount_paid)/SUM(dsp.amount_assigned))*100
        END,
        2
    ) AS collection_percentage,

    SUM(CASE
            WHEN dsp.payment_status='completed'
            THEN 1
            ELSE 0
        END) AS paid_members,

    SUM(CASE
            WHEN dsp.payment_status='pending'
            AND dsp.amount_paid>0
            THEN 1
            ELSE 0
        END) AS partial_members,

    SUM(CASE
            WHEN dsp.amount_paid=0
            THEN 1
            ELSE 0
        END) AS pending_members,

    COUNT(*) AS total_members

FROM donation_scheme_payments dsp
INNER JOIN donation_schemes ds
ON ds.id=dsp.donation_scheme_id

WHERE ds.id=?
GROUP BY ds.id;`;

  db.query(query, [id], callback);
};

//Get Members Scheme Details
exports.getMembersSchemeDetailsModel = (id, callback) => {
  const query = `SELECT
    u.id AS user_id,
    u.name,
    u.phone,

    dsp.amount_assigned AS target_amount,

    dsp.amount_paid,

    (dsp.amount_assigned - dsp.amount_paid) AS pending_amount,

    dsp.payment_status,

    ROUND(
        CASE
            WHEN dsp.amount_assigned=0 THEN 0
            ELSE
                (dsp.amount_paid/dsp.amount_assigned)*100
        END,
        2
    ) AS collection_percentage

FROM donation_scheme_payments dsp

INNER JOIN users u
ON u.id=dsp.user_id

WHERE
    dsp.donation_scheme_id = ?

ORDER BY u.name;`;

  db.query(query, [id], callback);
};
