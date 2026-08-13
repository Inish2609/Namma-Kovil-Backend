// const mysql = require('mysql2')

// require('dotenv').config()

// //Connect Mysql
// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
// })

// db.connect((err) => {
//     if (err) {
//         console.error("Database connection failed : ", err)
//     } else {
//         console.log("Database connected successfully")
//     }
// })

// module.exports = db

const mysql = require("mysql2");

require("dotenv").config();

// =====================================================
// MYSQL CONNECTION POOL
// =====================================================

const db = mysql.createPool({
  host: process.env.DB_HOST,

  port: Number(process.env.DB_PORT),

  user: process.env.DB_USER,

  password: process.env.DB_PASS,

  database: process.env.DB_NAME,

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0,

   connectTimeout: 20000,

  // Aiven uses TLS for service traffic
  ssl: {
    rejectUnauthorized: false,
  },
});

// =====================================================
// TEST DATABASE CONNECTION
// =====================================================

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed : ", err);

    return;
  }

  console.log("Database connected successfully");

  connection.release();
});

module.exports = db;
