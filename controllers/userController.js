const userModel = require('../models/userModel')

//Bcrypt
const bcrypt = require('bcryptjs')

//JWT TOKEN
const jwt = require('jsonwebtoken')

require('dotenv').config()


//Create User Function Controller
exports.register = async (req, res) => {
    const { name, phone, father_name, address, email, role, isAdmin, designation } = req.body
    const hashedPassword = await bcrypt.hash('NammaKovil@123', 10)
    //Model call
    userModel.createUser([name, phone, father_name, address, email, hashedPassword, role, isAdmin, designation], (err, result) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json({ message: 'User Created Sucessfully', value: result })
    })
}

//Login function controller
exports.login = async (req, res) => {
    const { phone, password } = req.body
    userModel.getUserByPhoneNumber(phone, async (err, result) => {
        if (err) {
            return res.status(500).json(err)
        } else if (result.length === 0) {
            return res.status(400).json({ message: "User Not Found" })
        }

        const user = result[0]

        console.log(user)

        const isMatch = await bcrypt.compare(password, user.password)

        console.log(isMatch)

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Crendentials" })
        }

        const jwtToken = jwt.sign({
            id: user.id
        }, process.env.JWT_SECERT, { expiresIn: '15m' })

        const refreshToken = jwt.sign({
            id: user.id
        }, process.env.JWT_REFRESH_SECERT, { expiresIn: '7d' })

        return res.status(200).json({ accessToken: jwtToken, refreshToken: refreshToken, message: "Password verified successfully", value: user })

    })
}

//Get All Users
exports.getAllUsers = async (req, res) => {
    userModel.getAllUsers((err, result) => {
        if (err) {
            return err.status(500).json({ message: 'Fetching all users Failed' })
        }
        return res.status(200).json({ message: "Users retrieved successfully", value: result })
    })
}

//Refresh Token Controller
exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh Token is required" })
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECERT, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid Refresh Token" })
        }
        const newAccessToken = jwt.sign({
            id: user.id
        }, process.env.JWT_SECERT, { expiresIn: '15m' })

        const newRefreshToken = jwt.sign({
            id: user.id
        }, process.env.JWT_REFRESH_SECERT, { expiresIn: '7d' })

        return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
    })
}


//Get Users By Role
exports.getUserByRole = async (req, res) => {
    const { role } = req.query
    userModel.getAllUsersByRole(role, (err, result) => {
        if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).json({ message: "Successfully fetched users by role", value: result })
    })
}

//Get All Users Total Pending Amount Details
exports.getAllUsersTotalPendingAmountDetails = async (req, res) => {
    userModel.getAllUsersTotalAmountsDetails((err, result) => {
        if(err) {
            return res.status(500).json({message: "Failed to get all users total Pending amount details", err})
        }
        return res.status(200).json({message: "Successfully Fetched all users total pending amount", value: result})
    })
}