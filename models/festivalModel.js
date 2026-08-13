const db = require("../config/db");

//Create Festival Query
exports.createFestival = (data, callback) => {
  const query = `INSERT INTO festivals (festival_name, amount, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, data, callback);
};

//Get Upcoming Festivals
exports.getUpcomingFestivals = (callback) => {
  const query = `SELECT id, festival_name, start_date
        FROM festivals
        WHERE start_date >= CURDATE()
        ORDER BY start_date ASC
        LIMIT 10`;
  db.query(query, callback);
};

//Get Festival Dashboard Details (Target Amount, Collected Amount, Pending Amount)
exports.getFestivalDashBoardDetails = (callback) => {
  const query = `SELECT
    f.id,
    f.festival_name,

    (f.amount * COUNT(u.id)) AS target_amount,

    COALESCE(SUM(p.amount_paid),0) AS collected_amount,

    ((f.amount * COUNT(u.id)) 
      - COALESCE(SUM(p.amount_paid),0)) AS pending_amount,

    ROUND(
      (COALESCE(SUM(p.amount_paid),0) /
      (f.amount * COUNT(u.id))) * 100
    ) AS percentage

FROM festivals f

CROSS JOIN users u

LEFT JOIN FESTIVAL_PAYMENTS p
ON p.festival_id=f.id
AND p.user_id=u.id

GROUP BY f.id;`;

  db.query(query, callback);
};

//Get User Festivals Summary By User Id
exports.getUserFestivalSummaryByUserId = (id, callback) => {
  const query = `SELECT

    u.id,
    u.name,

    COUNT(f.id) AS total_festivals,

    SUM(f.amount) AS assigned_amount,

    COALESCE(SUM(fp.amount_paid), 0) AS paid_amount,

    (SUM(f.amount) - COALESCE(SUM(fp.amount_paid), 0)) AS pending_amount,

    ROUND(
        (COALESCE(SUM(fp.amount_paid), 0) / SUM(f.amount)) * 100,
        0
    ) AS contribution_percentage

FROM users u

CROSS JOIN festivals f

LEFT JOIN festival_payments fp
ON fp.user_id = u.id
AND fp.festival_id = f.id

WHERE u.id = ?

GROUP BY u.id;`;

  db.query(query, [id], callback);
};

//Get User Festivals Contributions
exports.getUserFestivalsContributions = (id, callback) => {
  const query = `SELECT

    f.id,

    f.festival_name,

    f.amount AS total_amount,

    COALESCE(fp.amount_paid,0) AS paid_amount,

    (f.amount - COALESCE(fp.amount_paid,0)) AS pending_amount,

    ROUND(
        (COALESCE(fp.amount_paid,0) / f.amount) * 100,
        0
    ) AS percentage,

    CASE

        WHEN COALESCE(fp.amount_paid,0) >= f.amount
            THEN 'PAID'

        WHEN COALESCE(fp.amount_paid,0) = 0
            THEN 'PENDING'

        ELSE 'PARTIAL'

    END AS status

FROM festivals f

LEFT JOIN festival_payments fp
ON fp.festival_id = f.id
AND fp.user_id = ?

ORDER BY f.created_at DESC;`;

  db.query(query, [id], callback);
};

//Get All Festivals
exports.getAllFestivals = (callback) => {
  const query = `SELECT festival_name AS label, id AS value FROM festivals ORDER BY festival_name;`;
  db.query(query, callback);
};
