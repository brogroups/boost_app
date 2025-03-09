const MagazineModel = require("../models/magazine.model")
const SellingBreadToMagazineModel = require("../models/sellingBread.model")
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
            let sellingBreadToMagazines = await SellingBreadToMagazineModel.aggregate([
                { $match: { magazineId: key._id } },
                {
                    $lookup: {
                        from: "deliveries",
                        localField: "deliveryId",
                        foreignField: "_id",
                        as: "delivery"
                    }
                },
                {
                    $unwind: "$delivery"
                },
                {
                    $lookup: {
                        from: "typeofbreads",
                        localField: "typeOfBreadIds",
                        foreignField: "_id",
                        as: "typeOfBreads"
                    }
                },
                {
                    $lookup: {
                        from: "magazines",
                        localField: "magazineId",
                        foreignField: "_id",
                        as: "magazine"
                    }
                },
                {
                    $unwind: "$magazine"
                },
                {
                    $project: {
                        _id: 1,
                        quantity: 1,
                        typeOfBreads: 1,
                        quantity: 1,
                        paymentMethod: 1,
                        money: 1,
                        createdAt: 1,
                        delivery: {
                            _id: 1,
                            username: "$delivery.username"
                        },
                        magazine: {
                            _id: 1,
                            title: "$magazine.title"
                        }
                    }
                }
            ])
            sellingBreadToMagazines = sellingBreadToMagazines.map((item) => {
                let totalPrice = item.typeOfBreads.reduce((a, b) => a + b.price, 0) * item.quantity
                let pending = item.typeOfBreads.reduce((a, b) => a + b.price, 0)
                return { ...item, totalPrice, pending }
            })
            data.push({ ...key._doc, history: sellingBreadToMagazines, totalPrice: 0 })
        }


        await setCache(`magazine`, data.reverse())
        return res.status(200).json({
            success: true,
            message: "list of magazines",
            magazines: data.reverse()
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