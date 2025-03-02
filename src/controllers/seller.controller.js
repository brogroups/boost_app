const SellerModel = require("../models/seller.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { getCache, setCache, deleteCache } = require("../helpers/redis.helper")
const { default: mongoose } = require("mongoose")
const SellerPayedModel = require("../models/sellerPayed.model")
const { createSelleryPayed } = require("./sellerPayed.controller")

exports.createSeller = async (req, res) => {
    try {
        const { username, phone, price, ovenId } = req.body

        const password = phone.slice(-4)
        const hashPassword = await bcrypt.hash(password, 10)
        const superAdminId = req.use.id

        const newSeller = new SellerModel({
            username,
            password: hashPassword,
            phone,
            price,
            superAdminId,
            ovenId
        })
        const refreshToken = await jwt.sign({ id: newSeller._id, username: newSeller.username }, process.env.JWT_TOKEN_REFRESH)
        newSeller.refreshToken = refreshToken
        await newSeller.save()
        await deleteCache(`seller`)
        await deleteCache(`sellerPayed`)
        await createSelleryPayed({ body: { sellerId: newSeller._id, price: newSeller.price, status: "To`landi", type: "Kunlik" } })
        return res.status(201).json({
            success: true,
            message: "seller created",
            seller: {
                username: newSeller.username,
                password: newSeller.password
            }
        })
    }
    catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSellers = async (req, res) => {
    try {
        const cashedSeller = await getCache("seller")
        if (cashedSeller) {
            return res.status(200).json({
                success: true,
                message: "list of sellers",
                sellers: cashedSeller
            })
        }
        const use = req.use
        let sellers = await SellerModel.aggregate([
            { $match: { superAdminId: new mongoose.Types.ObjectId(use.id) } }
        ])
        const data = []
        for (const key of sellers) {
            const sellerPayedes = await SellerPayedModel.find({ sellerId: key._id })
            let totalPrice = sellerPayedes.reduce((a, b) => {
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
            const sellerPayed = sellerPayedes[sellerPayedes.length - 1]

            data.push({ ...key, price: sellerPayed?.price ? sellerPayed?.price : key.price, totalPrice, history: sellerPayedes })
        }

        await setCache("sellers", data)

        return res.status(200).json({
            success: true,
            message: "list of sellers",
            sellers: data
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
        let hashPassword;
        if (password) {
            hashPassword = await bcrypt.hash(password, 10)
        }
        const seller = await SellerModel.findByIdAndUpdate(req.params.id, password ? { username, password: hashPassword, phone, price, updateAt: new Date() } : { username, phone, price, updateAt: new Date() }, { new: true })
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "saller not found"
            })
        }
        await deleteCache(`seller`)
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
        const sellerPayeds = await SellerPayedModel.find({})
        sellerPayeds.forEach(async () => {
            await SellerPayedModel.deleteOne({ sellerId: seller._id })
        })
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "saller not found"
            })
        }
        await deleteCache(`seller`)
        await deleteCache(`sellerPayed`)
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
