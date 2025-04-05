const SellerBreadModel = require("../models/sellerBread.model")
const { getCache, setCache, deleteCache } = require("../helpers/redis.helper")
const { default: mongoose } = require("mongoose")
const SellingBreadModel = require("../models/sellingBread.model")
const SellerModel = require("../models/seller.model")
const SellerPayedModel = require("../models/sellerPayed.model")
const ManagerWareModel = require("../models/managerWare.model")


exports.createSellerBread = async (req, res) => {
    try {
        let sellerBread
        for (const key of req.body.typeOfBreadId) {
            let bread = await SellerBreadModel.findOne({ "typeOfBreadId.breadId": key.breadId, sellerId: new mongoose.Types.ObjectId(req.use.id), status: true })
            if (bread) {
                sellerBread = await SellerBreadModel.findByIdAndUpdate(bread._id, { totalQuantity: (bread.totalQuantity || 0) + key.quantity, totalQopQuantity: (bread.totalQopQuantity || 0) + key.qopQuantity, status: true }, { new: true })
            } else {
                sellerBread = await SellerBreadModel.create({
                    ...req.body,
                    sellerId: req.use.id,
                    totalQuantity: req.body.typeOfBreadId.reduce((a, b) => a + b.quantity, 0),
                    totalQopQuantity: req.body.typeOfBreadId.reduce((a, b) => a + b.qopQuantity, 0),
                    status: true
                })
            }

            let bread2 = await ManagerWareModel.findOne({ bread: key.breadId,status:true })
            if (bread2) {
                await ManagerWareModel.findByIdAndUpdate(bread2._id, { ...bread2, totalQuantity: bread2.totalQuantity + key.quantity, totalQopQuantity: bread2.totalQopQuantity + key.qopQuantity }, { new: true })
            } else {
                await ManagerWareModel.create({
                    sellerId: req.use.id, bread: key.breadId, totalQuantity: req.body.typeOfBreadId.reduce((a, b) => a + b.quantity, 0),
                    totalQopQuantity: req.body.typeOfBreadId.reduce((a, b) => a + b.qopQuantity, 0),
                })
            }
        }

        await deleteCache(`sellerBread${req.use.id}`)
        let sellerPayedBread = await sellerBread.populate("typeOfBreadId.breadId typeOfBreadId.breadId.breadId")
        sellerPayedBread = sellerPayedBread.typeOfBreadId?.reduce((a, b) => a + (b.qopQuantity * b.breadId.price4), 0)
        await SellerPayedModel.create({ sellerId: req.use.id, price: sellerPayedBread, type: "Ishhaqi", status: "To`landi", comment: "--------" })
        return res.status(201).json({
            success: true,
            message: "seller bread yaratildi",
            sellerBread
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSellerBread = async (req, res) => {
    try {
        const cache = null
        await getCache(`sellerBread${req.use.id}`)
        if (cache) {
            return res?.status(200)?.json({
                success: true,
                message: "list of seller breads",
                sellerBreads: cache?.reverse()
            })
        }
        let data = []
        let sellerBreads = []
        let updatedData = []
        let populatedSellerBreads = []
        switch (req.use.role) {
            case "seller":
                sellerBreads = await SellerBreadModel.aggregate([
                    { $match: { sellerId: new mongoose.Types.ObjectId(req.use.id), status: true } },
                ])
                populatedSellerBreads = await SellerBreadModel.populate(sellerBreads, {
                    path: 'typeOfBreadId.breadId',
                    model: 'TypeOfBread'
                });

                data = populatedSellerBreads.map((key) => {
                    const price = key.typeOfBreadId.reduce((sum, item) => sum + ((item?.breadId?.price4 || 0) * (item.qopQuantity || 0)), 0);
                    return { ...key, price };
                });

                updatedData = await Promise.all(data.map(async (key) => {
                    let sellingBread = await SellingBreadModel.aggregate([
                        {
                            $lookup: {
                                from: "sellerbreads",
                                localField: "typeOfBreadIds.breadId",
                                foreignField: "_id",
                                as: "breadDetails"
                            }
                        },
                        {
                            $unwind: {
                                path: "$breadDetails",
                                preserveNullAndEmptyArrays: true

                            }
                        },
                        {
                            $match: {
                                "breadDetails._id": key._id, status: true
                            }
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
                            $unwind: {
                                path: "$breadIdDetails",
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                typeOfBreadIds: {
                                    $map: {
                                        input: "$typeOfBreadIds",
                                        as: "typeOfBreadItem",
                                        in: {
                                            breadId: "$breadIdDetails",
                                            quantity: "$$typeOfBreadItem.quantity",
                                        }
                                    }
                                },
                                createdAt: 1,
                            }
                        }
                    ]);
                    return { ...key, history: sellingBread.map((i) => i.typeOfBreadIds).flat(Infinity) };
                }));
                break;
            case "manager":
                let sellers = await SellerModel.aggregate([
                    { $match: { superAdminId: new mongoose.Types.ObjectId(req.use.id), status: true } }
                ])
                for (const key of sellers) {
                    let sellerBread = await SellerBreadModel.aggregate([
                        { $match: { sellerId: new mongoose.Types.ObjectId(key._id), status: true } },
                        {
                            $lookup: {
                                from: "sellers",
                                localField: "sellerId",
                                foreignField: "_id",
                                as: "SELLER"
                            }
                        },
                        {
                            $unwind: "$SELLER",
                        },
                        {
                            $lookup: {
                                from: "typeofbreads",
                                localField: "typeOfBreadId.breadId",
                                foreignField: "_id",
                                as: 'bread'
                            }
                        },
                        {
                            $unwind: "$bread"
                        },
                        {
                            $project: {
                                typeOfBreadId: {
                                    $map: {
                                        input: "$typeOfBreadId",
                                        as: "item",
                                        in: {
                                            breadId: "$bread",
                                            quantity: "$$item.quantity",
                                            qopQuantity: "$$item.qopQuantity"
                                        }
                                    }
                                },
                                price: 1,
                                title: 1,
                                description: 1,
                                sellerId: {
                                    _id: "$SELLER._id",
                                    username: "$SELLER.username"
                                },
                                createdAt: 1,
                                totalQuantity: 1,
                                totalQopQuantity: 1,
                            }
                        }
                    ])
                    sellerBread.forEach((key) => {
                        const price = key.typeOfBreadId.reduce((sum, item) => sum + (item.breadId.price || 0), 0)
                        const totalPrice = key.typeOfBreadId.reduce((sum, item) => sum + ((item?.breadId?.price || 0) * (item.quantity || 0)), 0);

                        data.push({ ...key, totalPrice, price })
                    });
                }

                data = data.reduce((a, b) => {
                    const excite = a.find(i => String(i._id) === String(b._id))
                    if (!excite) {
                        a.push({ ...b })
                    }
                    return a
                }, [])

                updatedData = await Promise.all(data.map(async (i) => {
                    let sellerBread = []
                    for (const k of sellers) {
                        sellerBread.push(await SellerBreadModel.aggregate([
                            { $match: { sellerId: new mongoose.Types.ObjectId(k._id), status: true } },
                            {
                                $lookup: {
                                    from: "sellers",
                                    localField: "sellerId",
                                    foreignField: "_id",
                                    as: "SELLER"
                                }
                            },
                            {
                                $unwind: "$SELLER",
                            },
                            {
                                $lookup: {
                                    from: "typeofbreads",
                                    localField: "typeOfBreadId.breadId",
                                    foreignField: "_id",
                                    as: 'bread'
                                }
                            },
                            {
                                $unwind: "$bread"
                            },
                            {
                                $project: {
                                    typeOfBreadId: {
                                        $map: {
                                            input: "$typeOfBreadId",
                                            as: "item",
                                            in: {
                                                breadId: "$bread",
                                                quantity: "$$item.quantity",
                                                qopQuantity: "$$item.qopQuantity"
                                            }
                                        }
                                    },
                                    price: 1,
                                    sellerId: {
                                        _id: "$SELLER._id",
                                        username: "$SELLER.username"
                                    },
                                    createdAt: 1,
                                }
                            }
                        ]))
                    }
                    sellerBread = sellerBread.flat(Infinity).map((i) => {
                        return { ...i, _id: i._id, createdAt: i.createdAt, sellerId: i.sellerId, totalqopQuantity: i.typeOfBreadId.reduce((a, b) => a + b.qopQuantity, 0) }
                    })
                    let historyMap = new Map();

                    sellerBread.forEach(item => {
                        let sellerId = item.sellerId._id;

                        if (historyMap.has(sellerId)) {
                            let existing = historyMap.get(sellerId);
                            existing.totalQuantity += item.totalQuantity;
                            existing.totalqopQuantity += item.totalqopQuantity;
                        } else {
                            historyMap.set(sellerId, {
                                ...item,
                                totalQuantity: item.totalQuantity,
                                totalqopQuantity: item.totalqopQuantity
                            });
                        }
                    });


                    return {
                        ...i, history: Array.from(historyMap.values())
                    }
                }))

                break;
            case "superAdmin":
                sellerBreads = await SellerBreadModel.aggregate([
                    { $match: { status: true } },
                    {
                        $lookup: {
                            from: "sellers",
                            localField: "sellerId",
                            foreignField: "_id",
                            as: "SELLER"
                        }
                    },
                    {
                        $unwind: "$SELLER",
                    },
                    {
                        $lookup: {
                            from: "typeofbreads",
                            localField: "typeOfBreadId.breadId",
                            foreignField: "_id",
                            as: 'bread'
                        }
                    },
                    {
                        $unwind: "$bread"
                    },
                    {
                        $project: {
                            typeOfBreadId: {
                                $map: {
                                    input: "$typeOfBreadId",
                                    as: "item",
                                    in: {
                                        breadId: "$bread",
                                        quantity: "$$item.quantity",
                                        qopQuantity: "$$item.qopQuantity"
                                    }
                                }
                            },
                            title: 1,
                            price: 1,
                            description: 1,
                            sellerId: {
                                _id: "$SELLER._id",
                                username: "$SELLER.username"
                            },
                            createdAt: 1,
                            totalQopQuantity: 1,
                            totalQuantity: 1
                        }
                    }
                ])
                for (const key of sellerBreads) {
                    const price = key.typeOfBreadId.reduce((a, b) => a + (b?.breadId?.price * b.quantity), 0)
                    data.push({ ...key, price })
                }
                updatedData = await Promise.all(data.map(async (key) => {
                    let sellingBread = await SellingBreadModel.aggregate([
                        {
                            $lookup: {
                                from: "sellerbreads",
                                localField: "breadId",
                                foreignField: "_id",
                                as: "breadDetails"
                            }
                        },
                        {
                            $unwind: {
                                path: "$breadDetails",
                                preserveNullAndEmptyArrays: true

                            }
                        },
                        {
                            $match: {
                                "breadDetails._id": key._id,
                            }
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
                            $unwind: {
                                path: "$breadIdDetails",
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                breadDetails: "$breadDetails",
                                createdAt: 1
                            }
                        }
                    ]);
                    return { ...key, history: sellingBread.map((i) => i.typeOfBreadIds).flat(Infinity) };
                }));
                break;
            default:
                break;
        }

        // const endDay = new Date();
        // endDay.setHours(23, 59, 59, 999);
        // for (const key of updatedData) {
        //     if (new Date(key.createdAt).getDate() >= endDay.getDate()) {
        //         await SellerBreadModel.findByIdAndDelete(key._id)
        //     }
        // }
        await setCache(`sellerBread${req.use.id}`, updatedData)
        return res ? res?.status(200)?.json({
            success: true,
            message: "list of seller breads",
            sellerBreads: updatedData.reverse()
        }) : updatedData.reverse()
    }
    catch (error) {
        return res?.status(500)?.json({
            success: false,
            message: error.message
        })
    }
}

exports.getSellerById = async (req, res) => {
    try {
        const sellerBread = await SellerBreadModel.findById(req.params.id).populate("typeOfBreadId")
        if (!sellerBread) {
            return res.status(404).json({
                success: false,
                message: "seller bread not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of seller bread",
            sellerBread
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateSellerById = async (req, res) => {
    try {
        const sellerBread = await SellerBreadModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date(), totalQuantity: req.body.typeOfBreadId.reduce((a, b) => a + b.quantity, 0), totalQopQuantity: req.body.typeOfBreadId.reduce((a, b) => a + b.qopQuantity, 0), }, { new: true }).populate("typeOfBreadId")
        if (!sellerBread) {
            return res.status(404).json({
                success: false,
                message: "seller bread not found"
            })
        }
        await deleteCache(`sellerBread${req.use.id}`)
        return res.status(200).json({
            success: true,
            message: "seller bread updated",
            sellerBread: sellerBread
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteSellerById = async (req, res) => {
    try {
        const sellerBread = await SellerBreadModel.findByIdAndUpdate(req.params.id, { status: false }, { new: true })
        if (!sellerBread) {
            return res.status(404).json({
                success: false,
                message: "seller bread not found"
            })
        }
        await deleteCache(`sellerBread${req.use.id}`)
        return res.status(200).json({
            success: true,
            message: "seller bread deleted",
            sellerBread
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}