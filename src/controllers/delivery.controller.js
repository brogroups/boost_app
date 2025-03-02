const bcrypt = require("bcrypt")
const DeliveryModel = require("../models/delivery.model")
const DeliveryPayedModel = require("../models/deliveryPayed.model")
const jwt = require("jsonwebtoken")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose")
const { createdeliveryPayed } = require("./deliveryPayed.controller")


exports.createDelivery = async (req, res) => {
    try {
        const { username, phone, price } = req.body

        const password = phone.slice(-4)
        const superAdminId = req.use.id
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
        await deleteCache(`delivery`)
        await deleteCache("deliveryPayed")
        await createdeliveryPayed({ body: { deliveryId: newDelivery._id, price: newDelivery.price, status: "To`landi", type: "Kunlik" } })
        const accessToken = await jwt.sign({ id: newDelivery._id, username: newDelivery.username, role: "delivery" }, process.env.JWT_TOKEN_ACCESS, { expiresIn: "7d" })
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
        const cashe = null
        // await getCache(`delivery`)
        if (cashe) {
            return res.status(200).json({
                success: true,
                message: "list of deliveries",
                deliveries: cashe
            })
        }
        const deliveries = await DeliveryModel.aggregate([
            { $match: { superAdminId: new mongoose.Types.ObjectId(req.use.id) } }
        ])
        const data = []
        for (const key of deliveries) {
            const deliveryPayedes = await DeliveryPayedModel.aggregate([
                { $match: { deliveryId: key._id } }
            ])
            let totalPrice = deliveryPayedes.reduce((a, b) => {
                switch (b.type) {
                    case "Bonus":
                        return a + b?.price
                        break;
                    case "Shtraf":
                        return a - b?.price
                        break;
                    case "Kunlik":
                        return a + b?.price
                        break;
                    default:
                        break;
                }
            }, 0)
            data.push({ ...key, price: deliveryPayedes[deliveryPayedes.length - 1].price, deliveryPayed: deliveryPayedes, totalPrice })
        }
        await setCache(`delivery`, data)
        return res.status(200).json({
            success: true,
            message: "list of deliveries",
            deliveries: data
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
        let hashPassword;
        if (password) {
            hashPassword = await bcrypt.hash(password, 10)
        }
        const delivery = await DeliveryModel.findByIdAndUpdate(req.params.id, { username, hashPassword, phone, price, updateAt: new Date() }, { new: true })
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found"
            })
        }
        await deleteCache(`delivery`)
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
        const deliveryPayeds = await DeliveryPayedModel.find({})
        deliveryPayeds.forEach(async () => {
            await DeliveryPayedModel.deleteOne({ deliveryId: delivery._id })
        })
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found"
            })
        }
        await deleteCache(`delivery`)
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

exports.getDeliveryByToken = async (req, res) => {
    try {
        const deliveryId = req.use.id
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