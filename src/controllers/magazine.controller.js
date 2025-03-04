const MagazineModel = require("../models/magazine.model")
const SellingBreadToMagazineModel = require("../models/SellingBreadToMagazine.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')


exports.createMagazine = async (req, res) => {
    try {
        const newMagazine = await MagazineModel.create(req.body)
        await deleteCache(`magazine`)
        return res.status(201).json({
            success: true,
            message: "magazine created",
            magazine: newMagazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getMagazines = async (req, res) => {
    try {
        const cache = await getCache(`magazine`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of magazines",
                magazines: cache
            })
        }
        const magazines = await MagazineModel.find({})
        const data = []

        for (const key of magazines) {
            let sellingBreadToMagazines = await SellingBreadToMagazineModel.find({ magazineId: key._id }).populate("deliveryId magazineId typeOfBreads")
            sellingBreadToMagazines = sellingBreadToMagazines.map((item) => {
                let totalPrice = item.typeOfBreads.reduce((a, b) => a + b.price, 0) * item.quantity
                let pending = item.typeOfBreads.reduce((a, b) => a + b.price, 0)
                return { ...item._doc, totalPrice, pending }
            })
            data.push({ ...key._doc, history: sellingBreadToMagazines, totalPrice: 0 })
        }


        await setCache(`magazine`, data)
        return res.status(200).json({
            success: true,
            message: "list of magazines",
            magazines: data
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getMagazineById = async (req, res) => {
    try {
        const magazine = await MagazineModel.findById(req.params.id)
        if (!magazine) {
            return res.status(404).json({
                success: false,
                message: "magazine not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of magazine",
            magazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateMagazine = async (req, res) => {
    try {
        const magazine = await MagazineModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!magazine) {
            return res.status(404).json({
                success: false,
                message: "magazine not found"
            })
        }
        await deleteCache(`magazine`)
        return res.status(200).json({
            success: true,
            message: "magazine updated",
            magazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteMagazine = async (req, res) => {
    try {
        const magazine = await MagazineModel.findByIdAndDelete(req.params.id)
        const sellingBreadToMagazines = await SellingBreadToMagazineModel.find({ magazineId: magazine._id })
        sellingBreadToMagazines.forEach(async () => {
            await SellingBreadToMagazineModel.deleteOne({ magazineId: magazine._id })
        })
        if (!magazine) {
            return res.status(404).json({
                success: false,
                message: "magazine not found"
            })
        }
        await deleteCache(`magazine`)
        return res.status(200).json({
            success: true,
            message: "magazine deleted",
            magazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}