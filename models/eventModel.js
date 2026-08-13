const db = require("../config/db");

//Create Event model
exports.createEvent = (data, callback) => {
  //     const query = `INSERT INTO events (
  //     event_type,
  //     event_name,
  //     user_id,
  //     event_date_time,
  //     devotee_name,
  //     devotee_phone_number,
  //     devotee_address,
  //     amount,
  //     payment_status
  // ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

  //     db.query(query, data, callback)

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
                    INSERT INTO events (
    event_type,
    event_name,
    user_id,
    event_date_time,
    devotee_name,
    devotee_phone_number,
    devotee_address,
    amount,
    payment_status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

            connection.query(
              paymentQuery,

              [
                data.event_type,
                data.event_name,
                data.user_id ?? 0,
                data.event_date_time,
                data.devotee_name,
                data?.devotee_phone_number,
                data?.devotee_address,
                data?.amount ?? 0,
                data?.payment_status,
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

                    null,

                    paymentResult?.insertId,

                    receiptNumber,

                    "POOJA",

                    data.amount ?? 0,

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
                        eventPaymentId: paymentResult.insertId,

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

//Get Events By Date
exports.getEventsByDate = (date, callback) => {
  const query = `SELECT * FROM events WHERE DATE(event_date_time) = ?`;
  db.query(query, [date], callback);
};

//Get Events By Date Time
exports.getEventsByDateTime = (data, callback) => {
  const query = `SELECT * FROM events Where event_date_time = ?`;
  db.query(query, [data], callback);
};

//Get the Event Booked Slots By Date
exports.getEventBookedSlotsByDate = (data, callback) => {
  const query = `
        SELECT JSON_ARRAYAGG(
            DATE_FORMAT(event_date_time, '%H:%i:%s')
        ) AS booked_slots
        FROM events
        WHERE DATE(event_date_time) = ?;
    `;

  db.query(query, [data], callback);
};

function rollback(connection, error, callback) {
  connection.rollback(() => {
    connection.release();

    callback(error);
  });
}
