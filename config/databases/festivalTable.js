const db = require("../db")

//Create Festival Table
const query = `
CREATE TABLE IF NOT EXISTS festivals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    festival_name VARCHAR(100) NOT NULL,
    amount INT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

db.query(query, (err) => {
    if(err) {
        console.error("Festival Table Creation Failed : ", err)
    } else {
        console.log("Festival Table Created Successfully")
    }
    process.exit()
})