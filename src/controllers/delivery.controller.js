const bcrypt = require("bcrypt")
const DeliveryModel = require("../models/delivery.model")
const jwt = require("jsonwebtoken")

exports.createDelivery = async (req, res) => {
    try {
        const { username, password, phone, price } = req.body

        const superAdminId = req.useId
        const hashPassword = await bcrypt.hash(password, 10)
        const refreshToken = await jwt.sign({ username, password }, process.env.JWT_TOKEN_REFRESH)

        const newDelivery = await DeliveryModel.create({
            username,
            password: hashPassword,
            phone,
            price,
            refreshToken,
            superAdminId
        })

        const accessToken = await jwt.sign({ id: newDelivery._id, username: newDelivery.username }, process.env.JWT_TOKEN_ACCESS, { expiresIn: "7d" })
        return res.status(201).json({
            success: false,
            message: "delivery created",
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

exports.getDeliveries = async (req, res) => {
    try {
        const deliveries = await DeliveryModel.find({})
        return res.status(200).json({
            success: true,
            message: "list of deliveries",
            deliveries
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getDeliveryById = async (req, res) => {
    try {
        const delivery = await DeliveryModel.findById(req.params.id)
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of delivery",
            delivery
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.updateDelivery = async (req, res) => {
    try {
        const { username, password, phone, price } = req.body
        const hashPassword = await bcrypt.hash(password, 10)
        const delivery = await DeliveryModel.findByIdAndUpdate(req.params.id, { username, hashPassword, phone, price, updateAt: new Date() }, { new: true })
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "delivery updated",
            delivery
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteDelivery = async (req, res) => {
    try {
        const delivery = await DeliveryModel.findByIdAndDelete(req.params.id)
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "delivery deleted",
            delivery
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.loginDelivery = async (req, res) => {
    try {
        const { username, password } = req.body
        const delivery = await DeliveryModel.findOne({ username })
        if (!delivery) {
            return res.status(400).json({
                success: false,
                message: "Invalid Username or Password"
            })
        }
        const matchPassword = await bcrypt.compare(password, delivery.password)
        if (!matchPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password or Username"
            })
        }
        const accessToken = await jwt.sign({ id: delivery._id, username: delivery.username }, process.env.JWT_TOKEN_ACCESS, { expiresIn: "7d" })
        return res.status(200).json({
            success:true,
            message:"login is successfully",
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

exports.getDeliveryByToken = async (req,res)=>{
    try{
        const deliveryId = req.useId
        const delivery = await DeliveryModel.findById(deliveryId)
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of delivery",
            delivery
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}