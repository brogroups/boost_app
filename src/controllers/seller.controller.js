const SellerModel = require("../models/seller.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.createSeller = async (req, res) => {
    try {
        const { username, password, phone, price } = req.body
        const seller = await SellerModel.findOne({ username })

        const superAdminId = req.useId
        const hashPassword = await bcrypt.hash(password, 10)
        const refreshToken = await jwt.sign({ id: newSeller._id, username: newSeller.username }, process.env.JWT_TOKEN_REFRESH)
        const newSeller = new SellerModel({
            username,
            password: hashPassword,
            phone,
            price,
            superAdminId,
            refreshToken
        })
        await newSeller.save()
        const accessToken = await jwt.sign({ id: newSeller._id, username: newSeller.username }, process.env.JWT_TOKEN_ACCESS, { expiresIn: "7d" })
        return res.status(201).json({
            success: true,
            message: "seller created",
            accessToken
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSellers = async (req, res) => {
    try {
        const sellers = await SellerModel.find({})
        return res.status(200).json({
            success: true,
            message: "list of sellers",
            sellers
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSellerById = async (req, res) => {
    try {
        const seller = await SellerModel.findById(req.params.id)
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "saller not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of seller",
            seller
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateSeller = async (req, res) => {
    try {
        const { username, password, phone, price } = req.body
        const hashPassword = await bcrypt.hash(password, 10)
        const seller = await SellerModel.findByIdAndUpdate(req.params.id, { username, password: hashPassword, phone, price, updateAt: new Date() }, { new: true })
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "saller not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "seller updated",
            seller,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteSeller = async (req, res) => {
    try {
        const seller = await SellerModel.findByIdAndDelete(req.params.id)
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "saller not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "seller deleted",
            seller,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.loginSeller = async (req, res) => {
    try {
        const { username, password } = req.body
        const seller = await SellerModel.findOne({ username })
        if (!seller) {
            return res.status(400).json({
                success: false,
                message: "Invalid Username or Password"
            })
        }
        const matchPassword = await bcrypt.compare(password, seller.password)
        if (!matchPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid Username or Password"
            })
        }
        const accessToken = await jwt.sign({ id: seller._id, username: seller.username }, process.env.JWT_TOKEN_ACCESS, { expiresIn: "7d" })
        return res.status(201).json({
            success: true,
            message: "login is successfully",
            accessToken
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSellerToken = async (req, res) => {
    try { 
        const sellerId = req.useId
        console.log(sellerId);
        
        const seller = await SellerModel.findById(sellerId)
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "saller not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of seller",
            seller
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}