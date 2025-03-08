const ManagerModel = require("../models/manager.model")
const jwt = require("jsonwebtoken")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { encrypt } = require("../helpers/crypto.helper")
const SellerModel = require("../models/seller.model")
const DeliveryModel = require("../models/delivery.model")

exports.createManager = async (req, res) => {
    try {
        const { username, password } = req.body
        const superAdminId = req.use.id

        const refreshToken = await jwt.sign({ password, username }, process.env.JWT_TOKEN_REFRESH)
        const hashPassword = encrypt(password)

        const newManager = await ManagerModel.create({
            username,
            password: hashPassword,
            superAdminId,
            refreshToken
        })
        await deleteCache(`manager`)
        const accessToken = await jwt.sign({ id: newManager._id, username: newManager.username, role: "manager" }, process.env.JWT_TOKEN_ACCESS, { expiresIn: "7d" })
        return res.status(201).json({
            success: true,
            message: "manager created",
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

exports.getAllManagers = async (req, res) => {
    try {
        const cache = await getCache(`manager`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of managers",
                managers: cache
            })
        }
        const managers = await ManagerModel.find({})
        await setCache(`manager`, managers)
        return res.status(200).json({
            success: true,
            message: "list of managers",
            managers
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getManagerById = async (req, res) => {
    try {
        const manager = await ManagerModel.findById(req.params.id)
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "manager not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of manager",
            manager
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateManager = async (req, res) => {
    try {
        const { username, password, superAdminId } = req.body
        const hashPassword = encrypt(password)
        const manager = await ManagerModel.findByIdAndUpdate(req.params.id, { username, password: hashPassword, superAdminId, updateAt: new Date() }, { new: true })
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "manager not found"
            })
        }
        await deleteCache(`manager`)
        await deleteCache("delivery")
        await deleteCache(`seller`)
        return res.status(200).json({
            success: true,
            message: "manager updated",
            manager
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteManager = async (req, res) => {
    try {
        const manager = await ManagerModel.findByIdAndDelete(req.params.id)
        const sellers = await SellerModel.aggregate([
            { $match: { superAdminId: manager._id } }
        ])
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "manager not found"
            })
        }
        
        sellers.forEach(async () => {
           await SellerModel.deleteOne({ superAdminId: manager._id })
        })
        await deleteCache(`manager`)
        await deleteCache("delivery")
        await deleteCache(`seller`)
        return res.status(200).json({
            success: true,
            message: "manager deleted",
            manager
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
