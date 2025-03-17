const SellerBreadModel = require("../models/sellerBread.model")
const { getCache, setCache, deleteCache } = require("../helpers/redis.helper")
const { default: mongoose } = require("mongoose")
const { createSelleryPayed } = require("./sellerPayed.controller")
const { listenerCount } = require("../models/warehouse.model")
const SellingBreadModel = require("../models/sellingBread.model")


exports.createSellerBread = async (req, res) => {
    try {
        const sellerBread = await SellerBreadModel.create({
            ...req.body,
            sellerId: req.use.id
        })
        await deleteCache(`sellerBread`)
        let sellerPayedBread = await sellerBread.populate("typeOfBreadId.breadId typeOfBreadId.breadId.breadId")
        sellerPayedBread = sellerPayedBread.typeOfBreadId?.reduce((a, b) => a + (b.qopQuantity * b.breadId.price4), 0)
        await createSelleryPayed({ body: { sellerId: req.use.id, price: sellerPayedBread, type: "Ishhaqi", status: "To`landi" } })
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
         await getCache(`sellerBread`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of seller breads",
                sellerBreads: cache?.reverse()
            })
        }
        let data = []
        let sellerBreads = []
        switch (req.use.role) {
            case "seller":
                sellerBreads = await SellerBreadModel.aggregate([
                    { $match: { sellerId: new mongoose.Types.ObjectId(req.use.id) } },
                ])
                let populatedSellerBreads = await SellerBreadModel.populate(sellerBreads, {
                    path: 'typeOfBreadId.breadId',
                    model: 'TypeOfBread'
                });
                data = populatedSellerBreads.map((key) => {
                    const price = key.typeOfBreadId.reduce((sum, item) => sum + ((item?.breadId?.price || 0) * (item.quantity || 0)), 0);
                    const totalQuantity = key.typeOfBreadId.reduce((sum, item) => sum + (item.quantity || 0), 0);
                    const totalQopQuantity = key.typeOfBreadId.reduce((sum, item) => sum + (item.qopQuantity || 0), 0);

                    return { ...key, price, totalQuantity, totalQopQuantity };
                });
                break;
            case "superAdmin":
                sellerBreads = await SellerBreadModel.find({}).populate("typeOfBreadId.breadId")
                for (const key of sellerBreads) {
                    const price = key.typeOfBreadId.reduce((a, b) => a + (b?.breadId?.price * b.quantity), 0)
                    const totalQuantity = key.typeOfBreadId.reduce((a, b) => a + b.quantity, 0)
                    const totalQopQuantity = key.typeOfBreadId.reduce((a, b) => a + b.qopQuantity, 0)
                    data.push({ ...key._doc, price, totalQuantity, totalQopQuantity })
                }
                break;
            default:
                break;
        }
        let updatedData = await Promise.all(data.map(async (key) => {
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
                        "breadDetails._id": key._id
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
                        createdAt: 1
                    }
                }
            ]);
            return { ...key, history: sellingBread.map((i)=>i.typeOfBreadIds.map((it)=>it)).flat(Infinity) };
        }));
        await setCache(`sellerBread`, updatedData)
        return res.status(200).json({
            success: true,
            message: "list of seller breads",
            sellerBreads: updatedData.reverse()
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
        const sellerBread = await SellerBreadModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true }).populate("typeOfBreadId")
        if (!sellerBread) {
            return res.status(404).json({
                success: false,
                message: "seller bread not found"
            })
        }
        await deleteCache(`sellerBread`)
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
        const sellerBread = await SellerBreadModel.findByIdAndDelete(req.params.id).populate("typeOfBreadId")
        if (!sellerBread) {
            return res.status(404).json({
                success: false,
                message: "seller bread not found"
            })
        }
        await deleteCache(`sellerBread`)
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