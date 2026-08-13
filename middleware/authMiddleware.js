const jwt = require('jsonwebtoken')

require('dotenv').config()


//Verify Token Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        return res.status(403).json({ message: 'Access Denied' })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.JWT_SECERT, (err, decode) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid Access Token' })
        }

        req.user = decode

        next()
    })
}

module.exports = verifyToken