const express = require('express')

const userController = require('../controllers/userController')

const router = express.Router()

const verifyToken = require('../middleware/authMiddleware')

//Create a new User Route
router.post('/login', userController.login)

//Protected Routes
//Get All Users Route
router.get('/', verifyToken, userController.getAllUsers)

//Create a new User Route
router.post('/new-user', verifyToken, userController.register)

//Refresh Token Route
router.post('/refresh-token',verifyToken, userController.refreshToken)

//Get Users By Role Route
router.get('/get-user-by-role', verifyToken, userController.getUserByRole)

//Get All Users Total Pending Amount Detail Route
router.get("/get-all-users-total-pending-amount-details", verifyToken, userController.getAllUsersTotalPendingAmountDetails)

module.exports = router