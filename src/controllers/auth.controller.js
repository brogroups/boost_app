const ManagerModel = require("../models/manager.model")
const SuperAdminModel = require("../models/superAdmin.model")
const SellerModel = require('../models/seller.model')
const DeliveryModel = require('../models/delivery.model')
const jwt = require('jsonwebtoken')
const { decrypt, encrypt } = require("../helpers/crypto.helper")

exports.AuthLogin = async (req, res) => {
    try {
        const { username, password } = req.body
        let user = await ManagerModel.findOne({ username })
        let role = 'manager'
        if (!user) {
            user = await SuperAdminModel.findOne({ username })
            role = "superAdmin"
        }
        if (!user) {
            user = await DeliveryModel.findOne({ username })
            role = "delivery"
        }
        if (!user) {
            user = await SellerModel.findOne({ username })
            role = 'seller'
        }
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Username or Password"
            })
        }
        const decryptPassword = decrypt(user.password)

        if (decryptPassword !== password) {
            return res.status(400).json({
                success: false,
                message: "Invalid Username or Password"
            })
        }
        const accessToken = jwt.sign(
            { id: user._id, username: user.username, role },
            process.env.JWT_TOKEN_ACCESS,
            { expiresIn: "7d" }
        )

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            accessToken,
            role,
            username: user.username
        })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getUserByToken = async (req, res) => {
    try {
        const use = req.use
        let user = null


        if (use.role === 'manager') {
            user = await ManagerModel.findById(use.id)
        } else if (use.role === "superAdmin") {
            user = await SuperAdminModel.findById(use.id)
        } else if (use.role === 'seller') {
            user = await SellerModel.findById(use.id)
        } else if (use.role === 'delivery') {
            user = await DeliveryModel.findById(use.id)
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "backer api could not found this user"
            })
        }


        return res.status(200).json({
            success: true,
            message: 'all of this ok',
            user,
            role: use.role,
        })
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateUserAuth = async (req, res) => {
    try {
        const use = req.use
        let user = null
        const { password } = req.body

        const hashPassword = encrypt(password)
        if (use.role === 'manager') {
            user = await ManagerModel.findByIdAndUpdate(use.id, { password: hashPassword }, { new: true })
        } else if (use.role === "superAdmin") {
            user = await SuperAdminModel.findByIdAndUpdate(use.id, { password: hashPassword }, { new: true })
        } else if (use.role === 'seller') {
            user = await SellerModel.findByIdAndUpdate(use.id, { password: hashPassword }, { new: true })
        } else if (use.role === 'delivery') {
            user = await DeliveryModel.findByIdAndUpdate(use.id, { password: hashPassword }, { new: true })
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "server could not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: 'all of this ok',
            user,
            role: use.role
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getUserNameAndPasswordById = async (req, res) => {
    try {
        let user = await ManagerModel.findById(req.params.id)
        let role = 'manager'
        if (!user) {
            user = await SuperAdminModel.findById(req.params.id)
            role = "superAdmin"
        }
        if (!user) {
            user = await DeliveryModel.findById(req.params.id)
            role = "delivery"
        }
        if (!user) {
            user = await SellerModel.findById(req.params.id)
            role = 'seller'
        }
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Username or Password"
            })
        }
        const decryptPassword = decrypt(user.password)
        console.log(user,decryptPassword);
        
        return res.status(200).json({
            success: true,
            username: user?.username,
            password: decryptPassword
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}