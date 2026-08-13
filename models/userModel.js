const db = require('../config/db')

//Create User Query
exports.createUser = (data, callback) => {
    const query = `INSERT INTO users (name, phone, father_name, address, email, password, role, isAdmin, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    db.query(query, data, callback)
}

//Get User by Phone-Number Query
exports.getUserByPhoneNumber = (id, callback) => {
    const query = `SELECT * FROM users WHERE phone = ?`
    db.query(query, [id], callback)
}

//Get All Users Query
exports.getAllUsers = (callback) => {
    const query = `SELECT name AS label, id AS value FROM users`
    db.query(query, callback)
}

//Get All Committee Users
exports.getAllUsersByRole = (data, callback) => {
    const query = `SELECT * FROM users WHERE role = ?`
    db.query(query, [data], callback)
}

//Get All Users Pending Amount, Paided Amount for All Festival
exports.getAllUsersTotalAmountsDetails = (callback) => {
    const query = `SELECT
    u.id,
    u.name,

    SUM(f.amount) AS assigned_amount,

    COALESCE(SUM(p.amount_paid),0) AS paid_amount,

    SUM(f.amount)
    -
    COALESCE(SUM(p.amount_paid),0)
    AS pending_amount

FROM users u

CROSS JOIN festivals f

LEFT JOIN festival_payments p
ON p.user_id=u.id
AND p.festival_id=f.id

GROUP BY u.id

ORDER BY pending_amount DESC;`

db.query(query, callback)
}