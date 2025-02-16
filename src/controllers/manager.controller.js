const ManagerModel = require("../models/manager.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')

exports.createManager = async (req, res) => {
    try {
        const { username, password } = req.body
        const superAdminId = req.use.id

        const refreshToken = await jwt.sign({ password, username }, process.env.JWT_TOKEN_REFRESH)
        const hashPassword = await bcrypt.hash(password, 10)

        const newManager = await ManagerModel.create({
            username,
            password: hashPassword,
            superAdminId,
            refreshToken
        })
        await deleteCache(`manager`)
        const accessToken = await jwt.sign({ id: newManager._id, username: newManager.username }, process.env.JWT_TOKEN_ACCESS, { expiresIn: "7d" })
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
        await setCache(`manager`,managers)
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
        const hashPassword = await bcrypt.hash(password, 10)
        const manager = await ManagerModel.findByIdAndUpdate(req.params.id, { username, password: hashPassword, superAdminId, updateAt: new Date() }, { new: true })
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "manager not found"
            })
        }
        await deleteCache(`manager`)
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
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "manager not found"
            })
        }
        await deleteCache(`manager`)
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

exports.loginManager = async (req, res) => {
    try {
        const { username, password } = req.body
        const manager = await ManagerModel.findOne({ username })
        if (!manager) {
            return res.status(400).json({
                success: false,
                message: "Invalid Username or Password"
            })
        }
        const matchPassword = await bcrypt.compare(password, manager.password)
        if (!matchPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password or Username"
            })
        }
        const accessToken = await jwt.sign({ id: manager.id, username: manager.username }, process.env.JWT_TOKEN_ACCESS, { expiresIn: "7d" })
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


exports.getManagerByToken = async (req, res) => {
    try {
        const managerId = req.useId
        const manager = await ManagerModel.findById(managerId)
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