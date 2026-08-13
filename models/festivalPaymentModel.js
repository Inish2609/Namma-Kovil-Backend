const db = require("../config/db");

//Create Festival Payment Modal
exports.createFestivalPayment = (data, callback) => {
  //   const query =
  //     "INSERT INTO festival_payments (user_id, festival_id, amount_paid, payment_status) VALUES (?, ?, ?, ?)";
  //   db.query(query, data, callback);

  db.getConnection((connectionError, connection) => {
    if (connectionError) {
      return callback(connectionError);
    }

    /*
    =====================================================
    START TRANSACTION
    =====================================================
    */

    connection.beginTransaction((transactionError) => {
      if (transactionError) {
        connection.release();

        return callback(transactionError);
      }

      /*
      ===================================================
      1. GENERATE RECEIPT NUMBER
      ===================================================
      */

      const year = new Date().getFullYear();

      const sequenceQuery = `
        INSERT INTO receipt_sequences
        (
          year,
          last_number
        )
        VALUES (?, 1)

        ON DUPLICATE KEY UPDATE
          last_number = last_number + 1
      `;

      connection.query(sequenceQuery, [year], (sequenceError) => {
        if (sequenceError) {
          return rollback(connection, sequenceError, callback);
        }

        /*
          ===============================================
          GET GENERATED NUMBER
          ===============================================
          */

        const getSequenceQuery = `
            SELECT last_number

            FROM receipt_sequences

            WHERE year = ?

            FOR UPDATE
          `;

        connection.query(
          getSequenceQuery,
          [year],
          (sequenceSelectError, sequenceRows) => {
            if (sequenceSelectError) {
              return rollback(connection, sequenceSelectError, callback);
            }

            if (!sequenceRows.length) {
              return rollback(
                connection,
                new Error("Unable to generate receipt number"),
                callback,
              );
            }

            const sequenceNumber = sequenceRows[0].last_number;

            /*
              =========================================
              CREATE RECEIPT NUMBER
              =========================================
              */

            const receiptNumber = `NK-${year}-${String(sequenceNumber).padStart(
              6,
              "0",
            )}`;

            const paymentQuery = `
                    INSERT INTO festival_payments (user_id, festival_id, amount_paid, payment_status) VALUES (?, ?, ?, ?)
                 `;

            connection.query(
              paymentQuery,

              [
                data.user_id,
                data.festival_id,
                data.amount_paid ?? 0,
                data.payment_status ?? "SUCCESS",
              ],

              (paymentError, paymentResult) => {
                if (paymentError) {
                  return rollback(connection, paymentError, callback);
                }

                /*
                  =====================================
                  3. RECEIVED BY
                  =====================================
                  */

                let receivedBy = null;

                /*
                  Only CASH gets received_by.
                  */

                if (data.mode === "CASH") {
                  receivedBy = data.current_user_id;
                }
                /*
                  =====================================
                  4. INSERT PAYMENT HISTORY
                  =====================================
                  */

                const historyQuery = `
                    INSERT INTO payment_history
                    (
                      user_id,
                      received_by,
                      donation_scheme_id,
                      festival_id,
                      event_id,
                      receipt_number,
                      type,
                      amount,
                      mode,
                      payment_status,
                      transaction_id,
                      reference_number,
                      whatsapp_status
                    )

                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  `;

                connection.query(
                  historyQuery,

                  [
                    data.user_id,

                    receivedBy,

                    null,

                    data?.festival_id,

                    null,

                    receiptNumber,

                    "FESTIVAL",

                    data.amount_paid ?? 0,

                    data.mode,

                    "SUCCESS",

                    data.transaction_id ?? null,

                    data.reference_number ?? null,

                    "PENDING",
                  ],
                  (historyError, historyResult) => {
                    if (historyError) {
                      return rollback(connection, historyError, callback);
                    }

                    /*
                      =================================
                      5. COMMIT
                      =================================
                      */

                    connection.commit((commitError) => {
                      if (commitError) {
                        return rollback(connection, commitError, callback);
                      }

                      connection.release();

                      /*
                          =================================
                          EVERYTHING SUCCESSFUL
                          =================================
                          */

                      return callback(null, {
                        festivalPaymentId: paymentResult.insertId,

                        paymentHistoryId: historyResult.insertId,

                        receiptNumber,
                      });
                    });
                  },
                );
              },
            );
          },
        );
      });
    });
  });
};

//Get Festival Payment Details Modal
exports.getFestivalPaymentDetailsById = (id, callback) => {
  const query = `SELECT
    f.id,
    f.festival_name,
    f.amount AS amount_per_user,

    COUNT(u.id) AS total_members,

    (COUNT(u.id) * f.amount) AS target_amount,

    COALESCE(SUM(fp.amount_paid), 0) AS collected_amount,

    ((COUNT(u.id) * f.amount) - COALESCE(SUM(fp.amount_paid), 0)) AS pending_amount,

    ROUND(
        (COALESCE(SUM(fp.amount_paid), 0) / (COUNT(u.id) * f.amount)) * 100,
        0
    ) AS progress_percentage,

    SUM(
        CASE
            WHEN COALESCE(fp.amount_paid, 0) >= f.amount THEN 1
            ELSE 0
        END
    ) AS paid_members,

    SUM(
        CASE
            WHEN COALESCE(fp.amount_paid, 0) > 0
            AND COALESCE(fp.amount_paid, 0) < f.amount THEN 1
            ELSE 0
        END
    ) AS partial_members,

    SUM(
        CASE
            WHEN COALESCE(fp.amount_paid, 0) = 0 THEN 1
            ELSE 0
        END
    ) AS pending_members

FROM festivals f

CROSS JOIN users u

LEFT JOIN festival_payments fp
ON fp.user_id = u.id
AND fp.festival_id = f.id

WHERE f.id = ?

GROUP BY f.id;`;

  db.query(query, [id], callback);
};

//Get Users Festival Payment Details By Festival Id
exports.getUsersFestivalPaymentDetailsByFestivalId = (id, callback) => {
  const query = `SELECT

u.id,

u.name,

COALESCE(fp.amount_paid, 0) AS paid_amount,

f.amount AS total_amount,

(f.amount - COALESCE(fp.amount_paid, 0)) AS pending_amount,

ROUND(
    (COALESCE(fp.amount_paid, 0) / f.amount) * 100,
    0
) AS percentage,

CASE
    WHEN COALESCE(fp.amount_paid,0) >= f.amount
        THEN 'PAID'

    WHEN COALESCE(fp.amount_paid,0) = 0
        THEN 'PENDING'

    ELSE 'PARTIAL'
END AS status

FROM users u

CROSS JOIN festivals f

LEFT JOIN festival_payments fp
ON fp.user_id = u.id
AND fp.festival_id = f.id

WHERE f.id = 1

ORDER BY
status ASC,
pending_amount DESC,
u.name;`;

  db.query(query, [id], callback);
};

//Get User Festival Contribution By User Id and Festival Id
exports.getUserFestivalContributionByUserIdAndFestivalId = (data, callback) => {
  const query = `SELECT

    u.id AS user_id,

    u.name,

    f.id AS festival_id,

    f.festival_name,

    f.amount AS required_amount,

    COALESCE(fp.amount_paid, 0) AS paid_amount,

    (f.amount - COALESCE(fp.amount_paid, 0)) AS pending_amount,

    ROUND(
        (COALESCE(fp.amount_paid, 0) / f.amount) * 100,
        0
    ) AS progress_percentage

FROM users u

JOIN festivals f
ON f.id = ?

LEFT JOIN festival_payments fp
ON fp.user_id = u.id
AND fp.festival_id = f.id

WHERE u.id = ?;`;

  db.query(query, data, callback);
};

//Update the Festival Payment By user id and Festival Id
exports.updateFestivalPaymentByUserIdAndFestivalId = (data, callback) => {
  //   const query = `UPDATE festival_payments
  // SET
  //     amount_paid = amount_paid + ?,
  //     payment_status = ?
  // WHERE
  //     user_id = ?
  // AND
  //     festival_id = ?;`;

  //   db.query(query, data, callback);

  db.getConnection((connectionError, connection) => {
    if (connectionError) {
      return callback(connectionError);
    }

    /*
    =====================================================
    START TRANSACTION
    =====================================================
    */

    connection.beginTransaction((transactionError) => {
      if (transactionError) {
        connection.release();

        return callback(transactionError);
      }

      /*
      ===================================================
      1. GENERATE RECEIPT NUMBER
      ===================================================
      */

      const year = new Date().getFullYear();

      const sequenceQuery = `
        INSERT INTO receipt_sequences
        (
          year,
          last_number
        )
        VALUES (?, 1)

        ON DUPLICATE KEY UPDATE
          last_number = last_number + 1
      `;

      connection.query(sequenceQuery, [year], (sequenceError) => {
        if (sequenceError) {
          return rollback(connection, sequenceError, callback);
        }

        /*
          ===============================================
          GET GENERATED NUMBER
          ===============================================
          */

        const getSequenceQuery = `
            SELECT last_number

            FROM receipt_sequences

            WHERE year = ?

            FOR UPDATE
          `;

        connection.query(
          getSequenceQuery,
          [year],
          (sequenceSelectError, sequenceRows) => {
            if (sequenceSelectError) {
              return rollback(connection, sequenceSelectError, callback);
            }

            if (!sequenceRows.length) {
              return rollback(
                connection,
                new Error("Unable to generate receipt number"),
                callback,
              );
            }

            const sequenceNumber = sequenceRows[0].last_number;

            /*
              =========================================
              CREATE RECEIPT NUMBER
              =========================================
              */

            const receiptNumber = `NK-${year}-${String(sequenceNumber).padStart(
              6,
              "0",
            )}`;

            const paymentQuery = `UPDATE festival_payments
SET
    amount_paid = amount_paid + ?,
    payment_status = ?
WHERE
    user_id = ?
AND
    festival_id = ?;
                `;
            connection.query(
              paymentQuery,

              [
                data.amount_paid,

                data.payment_status,

                data.user_id ?? 0,

                data.festival_id ?? 0,
              ],

              (paymentError, paymentResult) => {
                if (paymentError) {
                  return rollback(connection, paymentError, callback);
                }

                /*
                  =====================================
                  3. RECEIVED BY
                  =====================================
                  */

                let receivedBy = null;

                /*
                  Only CASH gets received_by.
                  */

                if (data.mode === "CASH") {
                  receivedBy = data.current_user_id;
                }

                /*
                  =====================================
                  4. INSERT PAYMENT HISTORY
                  =====================================
                  */

                const historyQuery = `
                    INSERT INTO payment_history
                    (
                      user_id,
                      received_by,
                      donation_scheme_id,
                      festival_id,
                      event_id,
                      receipt_number,
                      type,
                      amount,
                      mode,
                      payment_status,
                      transaction_id,
                      reference_number,
                      whatsapp_status
                    )

                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  `;

                connection.query(
                  historyQuery,

                  [
                    data.user_id,

                    receivedBy,

                    null,

                    data?.festival_id,

                    null,

                    receiptNumber,

                    "FESTIVAL",

                    data.amount_paid ?? 0,

                    data.mode,

                    "SUCCESS",

                    data.transaction_id ?? null,

                    data.reference_number ?? null,

                    "PENDING",
                  ],
                  (historyError, historyResult) => {
                    if (historyError) {
                      return rollback(connection, historyError, callback);
                    }

                    /*
                      =================================
                      5. COMMIT
                      =================================
                      */

                    connection.commit((commitError) => {
                      if (commitError) {
                        return rollback(connection, commitError, callback);
                      }

                      connection.release();

                      /*
                          =================================
                          EVERYTHING SUCCESSFUL
                          =================================
                          */

                      return callback(null, {
                        festivalPaymentId: paymentResult.insertId,

                        paymentHistoryId: historyResult.insertId,

                        receiptNumber,
                      });
                    });
                  },
                );
              },
            );
          },
        );
      });
    });
  });
};

function rollback(connection, error, callback) {
  connection.rollback(() => {
    connection.release();

    callback(error);
  });
}
