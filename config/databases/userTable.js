const db = require('../db')

//Create User Table

const query = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    father_name VARCHAR(100) NOT NULL,
    address TEXT,
    email VARCHAR(50) UNIQUE,
    password VARCHAR(100),
    role VARCHAR(100),
    isAdmin BOOLEAN,
    designation VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

db.query(query, (err) => {
    if (err) {
        console.error("User Table Creation Failed : ", err)
    } else {
        console.log("User Table Created Successfully")
    }
    process.exit()
})