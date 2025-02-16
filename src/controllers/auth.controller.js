const ManagerModel = require("../models/manager.model")
const SuperAdminModel = require("../models/superAdmin.model")
const SellerModel = require('../models/seller.model')
const DeliveryModel = require('../models/delivery.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { setCache, getCache } = require("../helpers/redis.helper")

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
            user = await SellerModel.findOne({ username })
            role = 'seller'
        }
        if (!user) {
            user = await DeliveryModel.findOne({ username })
            role = "delivery"
        }
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Username or Password"
            })
        }
        const matchPassword = await bcrypt.compare(password, user.password)
        if (!matchPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password or Username"
            })
        }
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role },
            process.env.JWT_TOKEN_ACCESS,
            { expiresIn: "7d" }
        )

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            accessToken,
            role
        })
    }
    catch (error) {
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

        const casheKey = `user:${use.id}`
        const casheUser = await getCache(casheKey)

        if (casheUser) {            
            return res.status(200).json({
                success: true,
                message: 'all of this ok',
                user: casheUser
            })
        }

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
                message: "server could not found"
            })
        }
        setCache(casheKey, user)
        return res.status(200).json({
            success: true,
            message: 'all of this ok',
            user
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}