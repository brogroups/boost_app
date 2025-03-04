const SellingBreadToMagazineModel = require("../models/SellingBreadToMagazine.model")
const { deleteCache, setCache, getCache } = require("../helpers/redis.helper")

exports.create = async (req, res) => {
    try {
        const sellingBreadToMagazine = await SellingBreadToMagazineModel.create(req.body)
        await deleteCache(`sellingBreadToMagazine`)
        await deleteCache(`magazine`)
        return res.status(201).json({
            success: true,
            message: "selling bread to magazine created",
            sellingBreadToMagazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.findAll = async (req, res) => {
    try {
        const sellingBreadToMagazineCache = await getCache(`sellingBreadToMagazine`)
        if (sellingBreadToMagazineCache) {
            return res.status(200).json({
                success: true,
                message: "list of datas",
                sellingBreadToMagazines: sellingBreadToMagazineCache
            })
        }
        const sellingBreadToMagazines = await SellingBreadToMagazineModel.find({}).populate("deliveryId magazineId typeOfBreads")
        await setCache(`sellingBreadToMagazine`, sellingBreadToMagazines)
        return res.status(200).json({
            success: true,
            message: "list of datas",
            sellingBreadToMagazines
        })

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.findOne = async (req, res) => {
    try {
        const sellingBreadToMagazine = await SellingBreadToMagazineModel.findById(req.params.id).populate("deliveryId magazineId typeOfBreads")
        if (!sellingBreadToMagazine) {
            return res.status(404).json({
                success: false,
                message: "selling bread to magazine not found"
            })
        }
        return res.status(200).json({
            success: true,
            nessage: "selling bread to magazine found",
            sellingBreadToMagazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.update = async (req, res) => {
    try {
        const sellingBreadToMagazine = await SellingBreadToMagazineModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!sellingBreadToMagazine) {
            return res.status(404).json({
                success: false,
                message: "selling bread to magazine not found"
            })
        }
        await deleteCache(`sellingBreadToMagazine`)
        await deleteCache(`magazine`)
        return res.status(200).json({
            success: true,
            nessage: "selling bread to magazine updated",
            sellingBreadToMagazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.delete = async (req, res) => {
    try {
        const sellingBreadToMagazine = await SellingBreadToMagazineModel.findByIdAndDelete(req.params.id)
        if (!sellingBreadToMagazine) {
            return res.status(404).json({
                success: false,
                message: "selling bread to magazine not found"
            })
        }
        await deleteCache(`sellingBreadToMagazine`)
        await deleteCache(`magazine`)
        return res.status(200).json({
            success: true,
            nessage: "selling bread to magazine deleted",
            sellingBreadToMagazine
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}