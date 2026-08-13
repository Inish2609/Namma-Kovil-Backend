const db = require("../db")

// Create Donation Scheme Payment Table
const query = `
CREATE TABLE IF NOT EXISTS donation_scheme_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    donation_scheme_id INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    amount_assigned DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (donation_scheme_id) REFERENCES donation_schemes(id)
);
`

db.query(query, (err, result) => {
    if (err) {
        console.error("Error creating donation_scheme_payment table: ", err)
    } else {
        console.log("donation_scheme_payment table created or already exists.")
    }
    process.exit()
})