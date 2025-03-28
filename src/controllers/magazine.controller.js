const MagazineModel = require("../models/magazine.model")
const SellingBreadToMagazineModel = require("../models/sellingBread.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const MagazinePayedModel = require("../models/magazinePayed.model")
const { default: mongoose } = require("mongoose")
const SellingBreadModel = require("../models/sellingBread.model")


exports.createMagazine = async (req, res) => {
    try {
        const newMagazine = await MagazineModel.create({ ...req.body, status: true })
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
        const magazines = await MagazineModel.aggregate([
            { $match: { status: true } }
        ])
        const data = []

        switch (req.use.role) {
            case "superAdmin":
            case "manager":
                for (const key of magazines) {
                    let sellingBreadToMagazines = await SellingBreadToMagazineModel.aggregate([
                        { $match: { magazineId: key._id } },
                        {
                            $lookup: {
                                from: "sellerbreads",
                                localField: "breadId",
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
                                        input: "$breadDetails.typeOfBreadId",
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
                                pricetype: 1,
                                createdAt: 1,
                                quantity: 1
                            }
                        },
                    ])
                    let soldBread1 = await SellingBreadModel.aggregate([
                        {
                            $match: { magazineId: key._id,status: true }
                        },
                        {
                            $lookup: {
                                from: "sellerbreads",
                                localField: "breadId",
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
                                typeOfBreadIds: {
                                    $map: {
                                        input: "$breadDetails.typeOfBreadId",
                                        as: "breadIdItem",
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
                                            quantity: "$$breadIdItem.quantity"
                                        }
                                    }
                                },
                                paymentMethod: 1,
                                delivertId: 1,
                                quantity: 1,
                                magazineId: {
                                    _id: "$magazine._id",
                                    title: "$magazine.title"
                                },
                                money: 1,
                                createdAt: 1
                            }
                        },
                    ])
                    sellingBreadToMagazines = [...sellingBreadToMagazines, ...soldBread1]
                    let magazinePayed = await MagazinePayedModel.aggregate([
                        {
                            $match: { magazineId: new mongoose.Types.ObjectId(key._id) }
                        }
                    ])
                    magazinePayed = magazinePayed.reduce((a, b) => a + b.pending, 0)
                    sellingBreadToMagazines = sellingBreadToMagazines.flat(Infinity).map((item) => {
                        let totalPrice = item?.typeOfBreadIds?.reduce((a, b) => a + (item.pricetype === 'tan' ? b.breadId.price : item.pricetype === 'narxi' ? b.breadId.price2 : item.pricetype === 'toyxona' ? b.breadId.price3 : 0) * item.quantity, 0)
                        let pending = item?.typeOfBreadIds?.reduce((a, b) => a + (item.pricetype === 'tan' ? b.breadId.price : item.pricetype === 'narxi' ? b.breadId.price2 : item.pricetype === 'toyxona' ? b.breadId.price3 : 0) * item.quantity, 0) - item.money
                        return { ...item, totalPrice, pending }
                    })
                    data.push({ ...key, history: sellingBreadToMagazines, pending: -(sellingBreadToMagazines.reduce((a, b) => a + b.pending, 0) + key.pending) + magazinePayed })
                }
                break;
            case "delivery":
                for (const key of magazines) {
                    let sellingBreadToMagazines = await SellingBreadToMagazineModel.aggregate([
                        { $match: { magazineId: key._id } },
                        {
                            $lookup: {
                                from: "sellerbreads",
                                localField: "breadId",
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
                                        input: "$breadDetails.typeOfBreadId",
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
                                pricetype: 1,
                                createdAt: 1,
                                quantity: 1
                            }
                        },
                    ])
                    let soldBread1 = await SellingBreadModel.aggregate([
                        {
                            $match: { magazineId: key._id,  status: true }
                        },
                        {
                            $lookup: {
                                from: "sellerbreads",
                                localField: "breadId",
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
                                typeOfBreadIds: {
                                    $map: {
                                        input: "$breadDetails.typeOfBreadId",
                                        as: "breadIdItem",
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
                                            quantity: "$$breadIdItem.quantity"
                                        }
                                    }
                                },
                                paymentMethod: 1,
                                delivertId: 1,
                                quantity: 1,
                                magazineId: {
                                    _id: "$magazine._id",
                                    title: "$magazine.title"
                                },
                                money: 1,
                                createdAt: 1
                            }
                        },
                    ])
                    sellingBreadToMagazines = [...sellingBreadToMagazines, ...soldBread1]
                    let magazinePayed = await MagazinePayedModel.aggregate([
                        {
                            $match: { magazineId: new mongoose.Types.ObjectId(key._id) }
                        }
                    ])
                    magazinePayed = magazinePayed.reduce((a, b) => a + b.pending, 0)
                    sellingBreadToMagazines = sellingBreadToMagazines.flat(Infinity).map((item) => {
                        let totalPrice = item?.typeOfBreadIds?.reduce((a, b) => a + (item.pricetype === 'tan' ? b.breadId.price : item.pricetype === 'narxi' ? b.breadId.price2 : item.pricetype === 'toyxona' ? b.breadId.price3 : 0) * item.quantity, 0)
                        let pending = item?.typeOfBreadIds?.reduce((a, b) => a + (item.pricetype === 'tan' ? b.breadId.price : item.pricetype === 'narxi' ? b.breadId.price2 : item.pricetype === 'toyxona' ? b.breadId.price3 : 0) * item.quantity, 0) - item.money
                        return { ...item, totalPrice, pending }
                    })
                    data.push({ ...key, history: sellingBreadToMagazines, pending: -(sellingBreadToMagazines.reduce((a, b) => a + b.pending, 0) + key.pending) + magazinePayed })
                }
                break;
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
        const magazine = await MagazineModel.findByIdAndUpdate(req.params.id, { status: false }, { new: true })
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
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateMagazinePending = async (req, res) => {
    try {
        const magazine = await MagazinePayedModel.create(req.body)
        await deleteCache(`magazine`)
        return res.status(200).json({
            success: true,
            message: "Ok",
            magazine
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
