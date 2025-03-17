const SellingBreadModel = require("../models/sellingBread.model")
const { deleteCache, getCache, setCache } = require("../helpers/redis.helper");
const { createdeliveryPayed } = require("./deliveryPayed.controller");
const DeliveryModel = require("../models/delivery.model");
const SellerBreadModel = require("../models/sellerBread.model");
const OrderWithDeliveryModel = require("../models/orderWithDelivery.model");
const { default: mongoose } = require("mongoose");

exports.createSellingBread = async (req, res) => {
    try {
        let sellingBread;
        switch (req.use.role) {
            case "superAdmin":
                sellingBread = new SellingBreadModel(req.body)
                break;
            case "manager":
                sellingBread = new SellingBreadModel(req.body)
                break;
            case "delivery":
                sellingBread = new SellingBreadModel({ ...req.body, deliveryId: req.use.id })
                break;
        }
        let delivery = await DeliveryModel.findById(sellingBread.deliveryId)
        if (delivery) {
            for (const key of sellingBread.typeOfBreadIds) {
                let breadIds = await SellerBreadModel.aggregate([
                    {
                        $match: { _id: new mongoose.Types.ObjectId(key.breadId) }
                    },
                    {
                        $lookup: {
                            from: "typeofbreads",
                            localField: "typeOfBreadId.breadId",
                            foreignField: "_id",
                            as: "BREADID"
                        }
                    },
                    {
                        $unwind: "$BREADID"
                    },
                    {
                        $lookup: {
                            from: "sellers",
                            localField: "sellerId",
                            foreignField: "_id",
                            as: "seller"
                        }
                    },
                    {
                        $unwind: "$seller"
                    },
                    {
                        $project: {
                            _id: 1,
                            description: 1,
                            sellerId: {
                                _id: "$seller.id",
                                username: "$seller.username"
                            },
                            createdAt: 1,
                            typeOfBreadId: {
                                $map: {
                                    input: "$typeOfBreadId",
                                    as: "breadItem",
                                    in: {
                                        breadId: "$BREADID",
                                        quantity: "$$breadItem.quantity",
                                        qopQuantity: "$$breadItem.qopQuantity",
                                    }
                                }
                            }
                        }
                    }
                ])
                breadIds = breadIds.map((i) => i.typeOfBreadId).flat(Infinity)
                for (const bread of breadIds) {
                    if(key.quantity > bread.quantity){
                        return res.status(400).json({
                            succes:false,
                            message:"Bunday mahsulot yo`q"
                        })
                    }
                }
            }
            await createdeliveryPayed({ body: { deliveryId: delivery._id, price: sellingBread.typeOfBreadIds.reduce((a, b) => a + b.quantity, 0) * delivery.price, status: "To`landi", type: "Kunlik" }, res: {} })
            await sellingBread.save()
        } else {
            return res.status(404).json({
                success: false,
                message: "delivery topilmadi"
            })
        }
        await deleteCache(`sellingBread`)
        await deleteCache(`delivery`)
        return res.status(201).json({
            success: true,
            messahe: "selling bread created",
            sellingBread
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSellingBread = async (req, res) => {
    try {
        const cache =  await getCache(`sellingBread`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of selling breads",
                sellingBreads: cache?.reverse()
            })
        }
        let sellingBreads = await SellingBreadModel.find({}).populate({
            path: "typeOfBreadIds.breadId",
            model: "SellerBread"
        }).populate("deliveryId magazineId")
        sellingBreads = sellingBreads.map((item) => {
            const price = item.typeOfBreadIds.reduce((a, b) => a + (b?.breadId?.price * b.quantity), 0)
            return { ...item._doc, price: price }
        }).reverse()
        await setCache(`sellingBread`, sellingBreads)
        return res.status(200).json({
            success: true,
            message: "list of selling breads",
            sellingBreads: sellingBreads.reverse()
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getSellingBreadById = async (req, res) => {
    try {
        const sellingBread = await SellingBreadModel.findById(req.params.id).populate("typeOfBreadIds deliveryId magazineId")
        if (!sellingBread) {
            return res.status(404).json({
                success: false,
                message: "selling bread not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of selling bread",
            sellingBread: { ...sellingBread._doc, price: sellingBread.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * sellingBread.quantity }
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateSellingBreadById = async (req, res) => {
    try {
        const sellingBread = await SellingBreadModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true }).populate("typeOfBreadIds deliveryId")
        if (!sellingBread) {
            return res.status(404).json({
                success: false,
                message: "selling bread not found"
            })
        }
        await deleteCache(`sellingBread`)
        return res.status(200).json({
            success: true,
            message: "selling bread updated",
            sellingBread: { ...sellingBread._doc, price: sellingBread.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * sellingBread.quantity }
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.deleteSellingBreadById = async (req, res) => {
    try {
        const sellingBread = await SellingBreadModel.findByIdAndDelete(req.params.id).populate("typeOfBreadIds deliveryId")
        if (!sellingBread) {
            return res.status(404).json({
                success: false,
                message: "selling bread not found"
            })
        }
        await deleteCache(`sellingBread`)
        return res.status(200).json({
            success: true,
            message: "selling bread deleted",
            sellingBread: { ...sellingBread._doc, price: sellingBread.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * sellingBread.quantity }
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}