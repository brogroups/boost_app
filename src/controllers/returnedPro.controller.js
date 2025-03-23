const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose")
const ReturnedProModel = require("../models/returnedPro.model")
const OrderWithDeliveryModel = require('../models/orderWithDelivery.model')


exports.create = async (req, res) => {
    try {
        switch (req.use.role) {
            case "delivery":
                await ReturnedProModel.create({ ...req.body, deliveryId: new mongoose.Types.ObjectId(req.use.id) })
                break;
            default:
                return res.status(403).json({
                    success: false,
                    message: "Ruxsat yo'q"
                });
        }
        for (const key of req.body.orderWithDelivery) {
            await OrderWithDeliveryModel.findByIdAndUpdate(key,{status:false},{new:true})
        }
        await deleteCache(`returnedPro${req.use.id}`)
        await deleteCache(`sellerBread`)
        return res.status(201).json({
            success: true,
            message: "order with delivery created",

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
        const cache = null
        await getCache(`returnedPro${req.use.id}`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of order with delivereis",
                returnedPro: cache?.reverse()
            })
        }
        let returnedPro = []

        switch (req.use.role) {
            case "delivery":
                returnedPro = await ReturnedProModel.aggregate([
                    { $match: { deliveryId: new mongoose.Types.ObjectId(req.use.id) } },
                    {
                        $lookup: {
                            from: "orderwithdeliveries",
                            localField: "orderWithDelivery",
                            foreignField: "_id",
                            as: "order"
                        }
                    },
                    {
                        $unwind: "$order"
                    },
                    {
                        $lookup: {
                            from: "sellerbreads",
                            localField: "order.typeOfBreadIds.bread",
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
                        $project: {
                            _id: 1,
                            order: {
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
                                            quantity: "$$breadIdItem.quantity",
                                            _id: "$breadDetails._id"
                                        }
                                    }
                                },
                                description: "$order.description",
                                quantity: "$order.quantity",
                                pricetype: "$order.pricetype",
                                createdAt: "$order.createdAt",
                                title: "$breadDetails.title"
                            }
                        }
                    }
                ])
                returnedPro = returnedPro.map((item) => {
                    return { ...item, totalQuantity: item?.order?.typeOfBreadIds?.reduce((a, b) => a + b?.quantity, 0), totalPrice: item?.order.typeOfBreadIds?.reduce((a, b) => a + (item.pricetype === 'tan' ? b.breadId.price : item.pricetype === 'narxi' ? b.breadId.price2 : item.pricetype === 'toyxona' ? b.breadId.price3 : b.breadId.price) * b.quantity, 0) }
                })
        }
        await setCache(`returnedPro${req.use.id}`, returnedPro)
        return res.status(200).json({
            success: true,
            message: "list of returned products",
            returnedPro: returnedPro.reverse()
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
        const returnedPro = await ReturnedProModel.findById(req.params.id).populate("typeOfBreadIds sellerId deliveryId")
        if (!returnedPro) {
            return res.status(404).json({
                success: false,
                message: "order with delivery not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of order with delivery",
            returnedPro: { ...returnedPro._doc, price: returnedPro.typeOfBreadIds.reduce((a, b) => a + b.price, 0) * returnedPro.quantity }
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
        const { typeOfBreadIds, quantity, description, sellerBreadId, time } = req.body
        const returnedPro = await ReturnedProModel.findByIdAndUpdate(req.params.id, { typeOfBreadIds, quantity, description, sellerBreadId, time: time ? time : new Date(), updateAt: new Date() }, { new: true }).populate("typeOfBreadIds sellerId")
        if (!returnedPro) {
            return res.status(404).json({
                success: false,
                message: "order with delivery not found"
            })
        }
        await deleteCache(`returnedPro${req.use.id}`)
        return res.status(200).json({
            success: true,
            message: "order with delivery updated",
            returnedPro
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.remove = async (req, res) => {
    try {
        const returnedPro = await ReturnedProModel.findByIdAndUpdate(req.params.id,{status:false},{new:true})

        if (!returnedPro) {
            return res.status(404).json({
                success: false,
                message: "Order with delivery not found"
            });
        }

  
        await deleteCache(`returnedPro${req.use.id}`);

        return res.status(200).json({
            success: true,
            message: "Order with delivery deleted",
            returnedPro
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
