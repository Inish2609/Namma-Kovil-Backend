const db = require("../db")

//Create Donation Scheme Query

const query = `CREATE TABLE IF NOT EXISTS donation_schemes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scheme_name VARCHAR(100) NOT NULL,
    description TEXT,
    target_amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`

db.query(query, (err) => {
    if (err) {
        console.error("Donation Scheme Table Creation Failed : ", err)
    } else {
        console.log("Donation Scheme Table Created Successfully")
    }
    process.exit()
})