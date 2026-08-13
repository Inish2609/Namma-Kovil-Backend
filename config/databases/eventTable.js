const db = require('../db')

//Event Table Creation
const query = `
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(100),
    user_id INT,
    event_date_time DATETIME NOT NULL,
    devotee_name VARCHAR(100),
    devotee_phone_number VARCHAR(20),
    devotee_address TEXT,
    amount INT,
    payment_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
)
`

db.query(query, (err) => {
    if (err) {
        console.error("Event Table Creation Failed : ", err)
    } else {
        console.log("Event Table Created Successfully")
    }
    process.exit()
})