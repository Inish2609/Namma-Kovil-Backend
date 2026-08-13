const db = require("../config/db");

/*
=========================================================
CREATE PAYMENT HISTORY
=========================================================
*/

exports.createPaymentHistory = (data, callback) => {
  const query = `
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

  db.query(query, data, callback);
};

/*
=========================================================
GET PAYMENT HISTORY BY ID
=========================================================
*/

exports.getPaymentHistoryById = (paymentHistoryId, callback) => {
  const query = `
    SELECT *

    FROM payment_history

    WHERE id = ?

    LIMIT 1
  `;

  db.query(query, [paymentHistoryId], callback);
};

/*
=========================================================
GET COMPLETE RECEIPT DETAILS
=========================================================
*/

exports.getPaymentReceiptDetails = (paymentHistoryId, callback) => {
  const query = `
    SELECT

      /* =========================================
         PAYMENT
         ========================================= */

      ph.id,
      ph.receipt_number,
      ph.type,

      ph.amount AS paid_amount,

      ph.mode,
      ph.payment_status,
      ph.transaction_id,
      ph.reference_number,
      ph.whatsapp_status,
      ph.created_at,


      /* =========================================
         ASSIGNED AMOUNT
         ========================================= */

      CASE

        /* EVENT */

        WHEN UPPER(ph.type) = 'EVENT'
          THEN ph.amount


        /* POOJA */

        WHEN UPPER(ph.type) = 'POOJA'
          THEN ph.amount


        /* FESTIVAL */

        WHEN UPPER(ph.type) = 'FESTIVAL'
          THEN COALESCE(f.amount, 0)


        /* DONATION */

        WHEN UPPER(ph.type) = 'DONATION_SCHEME'
          THEN COALESCE(dsp.amount_assigned, 0)


        ELSE ph.amount

      END AS assigned_amount,


      /* =========================================
         TOTAL PAID AMOUNT
         ========================================= */

      CASE

        /* EVENT */

        WHEN UPPER(ph.type) = 'EVENT'
          THEN ph.amount


        /* POOJA */

        WHEN UPPER(ph.type) = 'POOJA'
          THEN ph.amount


        /* FESTIVAL */

        WHEN UPPER(ph.type) = 'FESTIVAL'
          THEN COALESCE(fp.amount_paid, 0)


        /* DONATION */

        WHEN UPPER(ph.type) = 'DONATION_SCHEME'
          THEN COALESCE(dsp.amount_paid, 0)


        ELSE ph.amount

      END AS total_paid_amount,


      /* =========================================
         PENDING AMOUNT
         ========================================= */

      CASE

        /* EVENT */

        WHEN UPPER(ph.type) = 'EVENT'
          THEN 0


        /* POOJA */

        WHEN UPPER(ph.type) = 'POOJA'
          THEN 0


        /* FESTIVAL */

        WHEN UPPER(ph.type) = 'FESTIVAL'
          THEN GREATEST(
            COALESCE(f.amount, 0)
            -
            COALESCE(fp.amount_paid, 0),
            0
          )


        /* DONATION */

        WHEN UPPER(ph.type) = 'DONATION_SCHEME'
          THEN GREATEST(
            COALESCE(dsp.amount_assigned, 0)
            -
            COALESCE(dsp.amount_paid, 0),
            0
          )


        ELSE 0

      END AS pending_amount,


      /* =========================================
         DONOR
         ========================================= */

      u.id AS donor_id,

      u.name AS donor_name,

      u.phone AS donor_mobile,

      u.address AS donor_address,


      /* =========================================
         RECEIVED BY
         ========================================= */

      rb.id AS received_by_id,

      rb.name AS received_by_name,


      /* =========================================
         DONATION SCHEME
         ========================================= */

      ds.id AS donation_id,

      ds.scheme_name AS donation_name,


      /* =========================================
         FESTIVAL
         ========================================= */

      f.id AS festival_id,

      f.festival_name AS festival_name,


      /* =========================================
         EVENT
         ========================================= */

      e.id AS event_id,

      e.event_name AS event_name


    FROM payment_history ph


    /* =========================================
       DONOR
       ========================================= */

    INNER JOIN users u
      ON u.id = ph.user_id


    /* =========================================
       RECEIVED BY
       ========================================= */

    LEFT JOIN users rb
      ON rb.id = ph.received_by


    /* =========================================
       DONATION
       ========================================= */

    LEFT JOIN donation_schemes ds
      ON ds.id = ph.donation_scheme_id


    /* =========================================
       DONATION PAYMENT

       Same user + same donation
       ========================================= */

    LEFT JOIN donation_scheme_payments dsp
      ON dsp.user_id = ph.user_id
      AND dsp.donation_scheme_id = ph.donation_scheme_id


    /* =========================================
       FESTIVAL
       ========================================= */

    LEFT JOIN festivals f
      ON f.id = ph.festival_id


    /* =========================================
       FESTIVAL PAYMENT
       ========================================= */

    LEFT JOIN festival_payments fp
      ON fp.user_id = ph.user_id
      AND fp.festival_id = ph.festival_id


    /* =========================================
       EVENT
       ========================================= */

    LEFT JOIN events e
      ON e.id = ph.event_id


    WHERE ph.id = ?

    LIMIT 1
  `;

  db.query(query, [paymentHistoryId], callback);
};

/*
=========================================================
UPDATE WHATSAPP STATUS
=========================================================
*/

exports.updateWhatsappStatus = (paymentHistoryId, status, callback) => {
  const query = `
    UPDATE payment_history

    SET whatsapp_status = ?

    WHERE id = ?
  `;

  db.query(
    query,

    [status, paymentHistoryId],

    callback,
  );
};

/*
=========================================================
UPDATE PAYMENT STATUS
=========================================================
*/

exports.updatePaymentStatus = (paymentHistoryId, status, callback) => {
  const query = `
    UPDATE payment_history

    SET payment_status = ?

    WHERE id = ?
  `;

  db.query(
    query,

    [status, paymentHistoryId],

    callback,
  );
};

/*
=========================================================
GET PAYMENT HISTORY BY RECEIPT NUMBER
=========================================================
*/

exports.getPaymentHistoryByReceiptNumber = (receiptNumber, callback) => {
  const query = `
    SELECT *

    FROM payment_history

    WHERE receipt_number = ?

    LIMIT 1
  `;

  db.query(query, [receiptNumber], callback);
};

/*
=========================================================
GET ALL PAYMENT HISTORY
=========================================================
*/

exports.getAllPaymentHistory = (callback) => {
  const query = `
    SELECT

      ph.*,

      u.name AS donor_name,

      u.mobile_number AS donor_mobile,

      rb.name AS received_by_name,

      ds.name AS donation_name,

      f.name AS festival_name,

      e.name AS event_name


    FROM payment_history ph


    INNER JOIN users u
      ON u.id = ph.user_id


    LEFT JOIN users rb
      ON rb.id = ph.received_by


    LEFT JOIN donation_schemes ds
      ON ds.id = ph.donation_scheme_id


    LEFT JOIN festivals f
      ON f.id = ph.festival_id


    LEFT JOIN events e
      ON e.id = ph.event_id


    ORDER BY ph.created_at DESC
  `;

  db.query(query, callback);
};
