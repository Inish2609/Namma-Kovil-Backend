const db = require("../db");

//Create Payment History Table
const query = `CREATE TABLE IF NOT EXISTS payment_history (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    received_by INT DEFAULT NULL,

    donation_scheme_id INT DEFAULT NULL,

    festival_id INT DEFAULT NULL,

    event_id INT DEFAULT NULL,

    receipt_number VARCHAR(100) NOT NULL UNIQUE,

    type ENUM(
        'DONATION_SCHEME',
        'FESTIVAL',
        'EVENT',
        'HALL_BOOKING',
        'POOJA',
        'GENERAL_DONATION'
    ) NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    mode ENUM(
        'CASH',
        'UPI',
        'GOOGLE_PAY',
        'PHONEPE',
        'PAYTM',
        'CARD',
        'BANK'
    ) NOT NULL,

    payment_status ENUM(
        'PENDING',
        'SUCCESS',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'SUCCESS',

    transaction_id VARCHAR(255),

    reference_number VARCHAR(255),

    receipt_pdf VARCHAR(500),

    whatsapp_status ENUM(
        'PENDING',
        'SENT',
        'FAILED'
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id),

    FOREIGN KEY (received_by)
        REFERENCES users(id),

    FOREIGN KEY (donation_scheme_id)
        REFERENCES donation_schemes(id),

    FOREIGN KEY (festival_id)
        REFERENCES festivals(id),

    FOREIGN KEY (event_id)
        REFERENCES events(id)
);`;

db.query(query, (err) => {
  if (err) {
    console.error("Payment History Table Creation Failed : ", err);
  } else {
    console.log("Payment History Table Created Successfully");
  }
  process.exit();
});

const receiptTableQuery = `CREATE TABLE IF NOT EXISTS receipt_sequences (
    year INT PRIMARY KEY,
    last_number INT NOT NULL DEFAULT 0
);`;

db.query(receiptTableQuery, (err) => {
  if (err) {
    console.error("Payment History Table Creation Failed : ", err);
  } else {
    console.log("Payment History Table Created Successfully");
  }
  process.exit();
});
