const MagazineModel = require("../models/magazine.model")
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
                    let sellingBreadToMagazines = await SellingBreadModel.aggregate([
                        { $match: { magazineId: key._id } },
                        {
                            $lookup: {
                                from: "managerwares",
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
                                localField: "breadDetails.bread",
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
                                breadId: {
                                    _id: "$breadIdDetails._id",
                                    title: "$breadIdDetails.title",
                                    price: "$breadIdDetails.price",
                                    price2: "$breadIdDetails.price2",
                                    price3: "$breadIdDetails.price3",
                                    price4: "$breadIdDetails.price4",
                                    createdAt: "$breadIdDetails.createdAt",
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
                        { $match: { magazineId: key._id, status: true } },
                        {
                            $lookup: {
                                from: "orderwithdeliveries",
                                localField: "breadId",
                                foreignField: "_id",
                                as: "breadIdd"
                            }
                        },
                        { $unwind: "$breadIdd" },
                        { $unwind: "$breadIdd.typeOfBreadIds" }, 
                        {
                            $lookup: {
                                from: "managerwares",
                                localField: "breadIdd.typeOfBreadIds.bread",
                                foreignField: "_id",
                                as: "breadDetails"
                            }
                        },
                        { $unwind: "$breadDetails" },
                        {
                            $lookup: {
                                from: "typeofbreads",
                                localField: "breadDetails.bread",
                                foreignField: "_id",
                                as: "breadIdDetails"
                            }
                        },
                        { $unwind: "$breadIdDetails" },
                        {
                            $lookup: {
                                from: "deliveries",
                                localField: "deliveryId",
                                foreignField: "_id",
                                as: "delivery"
                            }
                        },
                        { $unwind: "$delivery" },
                        {
                            $group: {
                                _id: "$_id",
                                bread: { $first: "$bread" },
                                paymentMethod: { $first: "$paymentMethod" },
                                deliveryId: { $first: { _id: "$delivery._id", username: "$delivery.username" } },
                                quantity: { $first: "$quantity" },
                                money: { $first: "$money" },
                                pricetype: { $first: "$pricetype" },
                                createdAt: { $first: "$createdAt" },
                                typeOfBreadIds: {
                                    $push: {
                                        breadId: {
                                            _id: "$breadIdDetails._id",
                                            title: "$breadIdDetails.title",
                                            price: "$breadIdDetails.price",
                                            price2: "$breadIdDetails.price2",
                                            price3: "$breadIdDetails.price3",
                                            price4: "$breadIdDetails.price4",
                                            createdAt: "$breadIdDetails.createdAt",
                                        },
                                        quantity: "$breadIdd.typeOfBreadIds.quantity"
                                    }
                                }
                            }
                        }
                    ])



                    sellingBreadToMagazines = [...sellingBreadToMagazines.map((item) => {
                        let totalPrice = (item.pricetype === 'tan' ? item?.breadId?.price : item.pricetype === 'dokon' ? item?.breadId?.price2 : item.pricetype === 'toyxona' ? item?.breadId?.price3 : b?.breadId.price) * item.quantity
                        let pending = totalPrice - item.money
                        return { ...item, totalPrice, pending }
                    }), ...soldBread1.map((item) => {
                        const breadId = item.typeOfBreadIds.find((i) => String(i.breadId._id) === String(item.bread))?.breadId
                        let totalPrice = (item.pricetype === 'tan' ? breadId?.price : item.pricetype === 'dokon' ? breadId?.price2 : item.pricetype === 'toyxona' ? breadId?.price3 : breadId.price) * item.quantity
                        let pending = totalPrice - item.money
                        return { ...item, totalPrice, pending }
                    })]


                    sellingBreadToMagazines = sellingBreadToMagazines.reduce((a, b) => {
                        const excite = a.find((i) => String(i._id) === String(b._id))
                        if (!excite) {
                            a.push({ ...b })
                        }
                        return a
                    }, [])






                    let magazinePayed = await MagazinePayedModel.aggregate([
                        {
                            $match: { magazineId: new mongoose.Types.ObjectId(key._id) }
                        }
                    ])
                    magazinePayed = magazinePayed.reduce((a, b) => a + b.pending, 0)
                    const pending = (sellingBreadToMagazines.reduce((a, b) => a + b.pending, 0) + key.pending) + magazinePayed
                    data.push({ ...key, history: sellingBreadToMagazines, pending })
                }
                break;
            case "delivery":

                for (const key of magazines) {
                    let sellingBreadToMagazines = await SellingBreadModel.aggregate([
                        { $match: { magazineId: key._id } },
                        {
                            $lookup: {
                                from: "managerwares",
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
                                localField: "breadDetails.bread",
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
                                breadId: {
                                    _id: "$breadIdDetails._id",
                                    title: "$breadIdDetails.title",
                                    price: "$breadIdDetails.price",
                                    price2: "$breadIdDetails.price2",
                                    price3: "$breadIdDetails.price3",
                                    price4: "$breadIdDetails.price4",
                                    createdAt: "$breadIdDetails.createdAt",
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
                                quantity: 1,
                                bread: 1
                            }
                        },
                    ])

                    let soldBread1 = await SellingBreadModel.aggregate([
                        { $match: { magazineId: key._id, status: true } },
                        {
                            $lookup: {
                                from: "orderwithdeliveries",
                                localField: "breadId",
                                foreignField: "_id",
                                as: "breadIdd"
                            }
                        },
                        { $unwind: "$breadIdd" },
                        { $unwind: "$breadIdd.typeOfBreadIds" }, // Har bir bread uchun alohida document
                        {
                            $lookup: {
                                from: "managerwares",
                                localField: "breadIdd.typeOfBreadIds.bread",
                                foreignField: "_id",
                                as: "breadDetails"
                            }
                        },
                        { $unwind: "$breadDetails" },
                        {
                            $lookup: {
                                from: "typeofbreads",
                                localField: "breadDetails.bread",
                                foreignField: "_id",
                                as: "breadIdDetails"
                            }
                        },
                        { $unwind: "$breadIdDetails" },
                        {
                            $lookup: {
                                from: "deliveries",
                                localField: "deliveryId",
                                foreignField: "_id",
                                as: "delivery"
                            }
                        },
                        { $unwind: "$delivery" },
                        {
                            $group: {
                                _id: "$_id",
                                bread: { $first: "$bread" },
                                paymentMethod: { $first: "$paymentMethod" },
                                deliveryId: { $first: { _id: "$delivery._id", username: "$delivery.username" } },
                                quantity: { $first: "$quantity" },
                                money: { $first: "$money" },
                                pricetype: { $first: "$pricetype" },
                                createdAt: { $first: "$createdAt" },
                                typeOfBreadIds: {
                                    $push: {
                                        breadId: {
                                            _id: "$breadIdDetails._id",
                                            title: "$breadIdDetails.title",
                                            price: "$breadIdDetails.price",
                                            price2: "$breadIdDetails.price2",
                                            price3: "$breadIdDetails.price3",
                                            price4: "$breadIdDetails.price4",
                                            createdAt: "$breadIdDetails.createdAt",
                                        },
                                        quantity: "$breadIdd.typeOfBreadIds.quantity"
                                    }
                                }
                            }
                        }
                    ])



                    sellingBreadToMagazines = [...sellingBreadToMagazines.map((item) => {
                        let totalPrice = (item.pricetype === 'tan' ? item?.breadId?.price : item.pricetype === 'dokon' ? item?.breadId?.price2 : item.pricetype === 'toyxona' ? item?.breadId?.price3 : b?.breadId.price) * item.quantity
                        let pending = totalPrice - item.money
                        return { ...item, totalPrice, pending }
                    }), ...soldBread1.map((item) => {
                        const breadId = item.typeOfBreadIds.find((i) => String(i.breadId._id) === String(item.bread))?.breadId
                        console.log(breadId)
                        let totalPrice = (item.pricetype === 'tan' ? breadId?.price : item.pricetype === 'dokon' ? breadId?.price2 : item.pricetype === 'toyxona' ? breadId?.price3 : breadId.price) * item.quantity
                        let pending = totalPrice - item.money
                        return { ...item, totalPrice, pending }
                    })]


                    sellingBreadToMagazines = sellingBreadToMagazines.reduce((a, b) => {
                        const excite = a.find((i) => String(i._id) === String(b._id))
                        if (!excite) {
                            a.push({ ...b })
                        }
                        return a
                    }, [])


                    let magazinePayed = await MagazinePayedModel.aggregate([
                        {
                            $match: { magazineId: new mongoose.Types.ObjectId(key._id) }
                        }
                    ])
                    magazinePayed = magazinePayed.reduce((a, b) => a + b.pending, 0)

                    data.push({ ...key, history: sellingBreadToMagazines, pending: (sellingBreadToMagazines.reduce((a, b) => a + b.pending, 0) + key.pending) + magazinePayed })
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
        console.error(error.message)
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
