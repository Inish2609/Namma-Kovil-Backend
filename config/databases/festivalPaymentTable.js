const db = require("../db")

//Create Festival Payment Table Query
const query = `CREATE TABLE IF NOT EXISTS festival_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    festival_id INT NOT NULL,
    amount_paid INT NOT NULL DEFAULT 0,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (festival_id) REFERENCES festivals(id)
)`

db.query(query, (err) => {
    if (err) {
        console.error("Festival Payment Table Creation Failed : ", err)
    } else {
        console.log("Festival Payment Table Created Successfully")
    }
    process.exit()
})