const db = require("../config/db");

//Create Donation Scheme Payment Query
exports.createDonationSchemePayment = (data, callback) => {
  const query = `INSERT INTO donation_scheme_payments (user_id, donation_scheme_id, amount_paid, amount_assigned, payment_status) VALUES (?, ?, ?, ?, ?)`;
  db.query(
    query,
    [
      data.user_id,
      data.donation_scheme_id,
      data.amount_paid,
      data.amount_assigned,
      data.payment_status,
    ],
    callback,
  );
};

//Get the User Scheme Payment Details by User id and Scheme id Model
exports.getUserSchemePaymentDetailsByUserIdAndSchemeIdModel = (
  data,
  callback,
) => {
  const query = `SELECT
    dsp.user_id,
    dsp.donation_scheme_id,
    ds.scheme_name,
    dsp.amount_assigned,
    ds.description,
    COALESCE(SUM(dsp.amount_paid), 0) AS total_paid,
    (dsp.amount_assigned - COALESCE(SUM(dsp.amount_paid), 0)) AS pending_amount,
    CASE
        WHEN COALESCE(SUM(dsp.amount_paid), 0) >= dsp.amount_assigned
            THEN 'completed'
        ELSE 'pending'
    END AS payment_status
FROM donation_scheme_payments dsp
INNER JOIN donation_schemes ds
    ON ds.id = dsp.donation_scheme_id
WHERE
    dsp.user_id = ?
    AND dsp.donation_scheme_id = ?
GROUP BY
    dsp.user_id,
    dsp.donation_scheme_id,
    dsp.amount_assigned,
    ds.scheme_name;`;

  db.query(query, data, callback);
};

//Update the Amount Paid By the User to the Scheme
exports.updateAmountPaidByUserForSchemeModel = (data, callback) => {
  //   const query = `UPDATE donation_scheme_payments
  // SET
  //     amount_paid = amount_paid + ?,
  //     payment_status = CASE
  //         WHEN (amount_paid + ?) >= amount_assigned
  //             THEN 'completed'
  //         ELSE 'pending'
  //     END
  // WHERE
  //     user_id = ?
  //     AND donation_scheme_id = ?;`;
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

            const paymentQuery = `UPDATE donation_scheme_payments
SET
    amount_paid = amount_paid + ?,
    payment_status = CASE
        WHEN (amount_paid + ?) >= amount_assigned
            THEN 'completed'
        ELSE 'pending'
    END
WHERE
    user_id = ?
    AND donation_scheme_id = ?;`;

            connection.query(
              paymentQuery,
              [
                data.amount_paid,

                data.amount_paid,

                data.userId ?? 0,

                data.schemeId ?? 0,
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
                    data.userId,

                    receivedBy,

                    data.schemeId,

                    null,

                    null,

                    receiptNumber,

                    "DONATION_SCHEME",

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
                        donationPaymentId: paymentResult.insertId,

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

//Get Scheme Donation Assignment Summary
exports.getSchemeDonationAssignmentSummayDetailsModel = (id, callback) => {
  const query = `
  SELECT
    ds.id,
    ds.scheme_name,
    ds.target_amount,

    COALESCE(SUM(dsp.amount_assigned),0) AS assigned_amount,

    ds.target_amount - COALESCE(SUM(dsp.amount_assigned),0) AS remaining_amount,

    ROUND(
        (COALESCE(SUM(dsp.amount_assigned),0) /
        ds.target_amount) * 100,
        2
    ) AS assignment_percentage,

    COUNT(dsp.id) AS total_members

FROM donation_schemes ds

LEFT JOIN donation_scheme_payments dsp
ON dsp.donation_scheme_id = ds.id

WHERE ds.id = ?

GROUP BY ds.id;
  `;

  db.query(query, [id], callback);
};

//Check Donation Scheme Assigned to this User
exports.checkDonationSchemeAssignedModel = (data, callback) => {
  const query = `SELECT EXISTS (
            SELECT 1
            FROM donation_scheme_payments
            WHERE user_id = ?
              AND donation_scheme_id = ?
        ) AS is_assigned;`;

  db.query(query, data, callback);
};

function rollback(connection, error, callback) {
  connection.rollback(() => {
    connection.release();

    callback(error);
  });
}
