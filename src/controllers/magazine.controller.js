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
        const cache = null
        await getCache(`magazine`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of magazines",
                magazines: cache?.reverse()
            })
        }
        const magazines = await MagazineModel.find({})
        const data = []

        for (const key of magazines) {
            let sellingBreadToMagazines = await SellingBreadToMagazineModel.aggregate([
                { $match: { magazineId: key._id } },
                {
                    $lookup: {
                        from: "sellerbreads",
                        localField: "typeOfBreadIds.breadId",
                        foreignField: "_id",
                        as: "breadDetails"
                    }
                },
                {
                    $unwind: "$breadDetails",
                },
                {
                    $lookup: {
                        from: "typeofbreads",
                        localField: "breadDetails.typeOfBreadId.breadId",
                        foreignField: "_id",
                        as: "breadIdDetails"
                    }
                },
                {
                    $unwind: "$breadIdDetails",
                },
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
                    $project: {
                        _id: 1,
                        typeOfBreadIds: {
                            $map: {
                                input: "$typeOfBreadIds",
                                as: "breadItem",
                                in: {
                                    breadId: {
                                        _id: "$breadIdDetails._id",
                                        title: "$breadIdDetails.title",
                                        price: "$breadIdDetails.price",
                                        price2: "$breadIdDetails.price2",
                                        price3: "$breadIdDetails.price3",
                                        price4: "$breadIdDetails.price4",
                                        createdAt: "$breadIdDetails.createdAt",
                                    },
                                    quantity: "$$breadItem.quantity"
                                }
                            }
                        },
                        paymentMethod: 1,
                        deliveryId: {
                            _id: "$delivery._id",
                            username: "$delivery.username"
                        },
                        magazineId: 1,
                        money: 1,
                        createdAt: 1
                    }
                },
            ])
            sellingBreadToMagazines = sellingBreadToMagazines.flat(Infinity).map((item) => {
                let totalPrice = item?.typeOfBreadIds?.reduce((a, b) => a + (b?.breadId?.price * b.quantity), 0)
                let pending = item?.typeOfBreadIds?.reduce((a, b) => a + b?.breadId?.price, 0) - item.money
                return { ...item, totalPrice, pending }
            })
            data.push({ ...key._doc, history: sellingBreadToMagazines, pending: sellingBreadToMagazines.reduce((a, b) => a + b.pending, 0) })
        }


        await setCache(`magazine`, data)
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