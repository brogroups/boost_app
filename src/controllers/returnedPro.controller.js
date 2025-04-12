const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose")
const ReturnedProModel = require("../models/returnedPro.model")
const OrderWithDeliveryModel = require('../models/orderWithDelivery.model')


exports.create = async (req, res) => {
    try {
        let returned = null
        switch (req.use.role) {
            case "delivery":
                returned = await ReturnedProModel.create({ ...req.body, deliveryId: new mongoose.Types.ObjectId(req.use.id) })
                break;
            default:
                return res.status(403).json({
                    success: false,
                    message: "Ruxsat yo'q"
                });
        }
        await OrderWithDeliveryModel.findByIdAndUpdate(req.body.orderWithDelivery, { status: false }, { new: true })
        await deleteCache(`returnedPro${req.use.id}`)
        await deleteCache(`sellerBread`)
        return res.status(201).json({
            success: true,
            message: "order with delivery created",
            returned

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
                returnedPro = [...returnedPro, ...await ReturnedProModel.aggregate([
                    {
                        $match: {
                            deliveryId: new mongoose.Types.ObjectId(req.use.id),
                            status: true
                        }
                    },
                    {
                        $lookup: {
                            from: "orderwithdeliveries",
                            localField: "orderWithDelivery",
                            foreignField: "_id",
                            as: "order"
                        }
                    },
                    { $unwind: "$order" },
                    { $unwind: "$order.typeOfBreadIds" },
                    {
                        $lookup: {
                            from: "managerwares",
                            localField: "order.typeOfBreadIds.bread",
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
                        $lookup:{
                            frm:"deliveries"
                        }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            breads: {
                                $push: {
                                    breadId: {
                                        _id: "$breadIdDetails._id",
                                        title: "$breadIdDetails.title",
                                        price: "$breadIdDetails.price",
                                        price2: "$breadIdDetails.price2",
                                        price3: "$breadIdDetails.price3",
                                        price4: "$breadIdDetails.price4",
                                        createdAt: "$breadIdDetails.createdAt"
                                    },
                                    quantity: "$order.typeOfBreadIds.quantity",
                                    _id: "$breadDetails._id"
                                }
                            },
                            orderDescription: { $first: "$order.description" },
                            orderQuantity: { $first: "$order.totalQuantity" },
                            orderPricetype: { $first: "$order.pricetype" },
                            orderCreatedAt: { $first: "$order.createdAt" }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            order: {
                                typeOfBreadIds: "$breads",
                                description: "$orderDescription",
                                totalQuantity: "$orderQuantity",
                                pricetype: "$orderPricetype",
                                createdAt: "$orderCreatedAt"
                            }
                        }
                    }
                ])]
                returnedPro = returnedPro.map((item) => {
                    return {
                        ...item,
                        price: item?.order?.pricetype === "tan" ? item?.order?.typeOfBreadIds[0]?.breadId?.price : item?.order?.pricetype === "dokon" ? item?.order?.typeOfBreadIds[0]?.breadId?.price2 : item?.order?.pricetype === "toyxona" ? item?.order?.typeOfBreadIds[0]?.breadId?.price3 : item?.order?.typeOfBreadIds[0]?.breadId?.price,
                        totalPrice: item?.order.typeOfBreadIds?.reduce((a, b) => a + (item.pricetype === 'tan' ? b.breadId.price : item.pricetype === 'narxi' ? b.breadId.price2 : item.pricetype === 'toyxona' ? b.breadId.price3 : b.breadId.price) * b.quantity, 0)
                    }
                })
                break;
            case "superAdmin":
            case "manager": {

                returnedPro = [...returnedPro, ...await ReturnedProModel.aggregate([
                    { $match: { status: true } },
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
                            from: "managerwares",
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
                            localField: "breadDetails.bread",
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
                                _id: "$order._id",
                                typeOfBreadIds: {
                                    $map: {
                                        input: "$order.typeOfBreadIds",
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
                                title: "$breadDetails.title",
                                totalQuantity: 1,
                            }
                        }
                    }
                ])]
                returnedPro = returnedPro.map((item) => {
                    return { ...item, totalPrice: item?.order.typeOfBreadIds?.reduce((a, b) => a + (item.order.pricetype === 'tan' ? b.breadId.price : item.order.pricetype === 'dokon' ? b.breadId.price2 : item.order.pricetype === 'toyxona' ? b.breadId.price3 : b.breadId.price), 0) * item.order.totalQuantity, price: item?.order?.pricetype === "tan" ? item?.order?.typeOfBreadIds[0]?.breadId?.price : item?.order?.pricetype === "dokon" ? item?.order?.typeOfBreadIds[0]?.breadId?.price2 : item?.order?.pricetype === "toyxona" ? item?.order?.typeOfBreadIds[0]?.breadId?.price3 : item?.order?.typeOfBreadIds[0]?.breadId?.price, }
                })
                break;
            }
            // await ReturnedProModel.aggregate([
            //     { $match: { status: true } },
            //     {
            //         $lookup: {
            //             from: "orderwithdeliveries",
            //             localField: "orderWithDelivery",
            //             foreignField: "_id",
            //             as: "order"
            //         }
            //     },
            //     { $unwind: "$order" },
            //     { $unwind: "$order.typeOfBreadIds" },
            //     {
            //         $lookup: {
            //             from: "managerwares",
            //             localField: "order.typeOfBreadIds.bread",
            //             foreignField: "_id",
            //             as: "breadDetails"
            //         }
            //     },
            //     { $unwind: "$breadDetails" },
            //     {
            //         $lookup: {
            //             from: "typeofbreads",
            //             localField: "breadDetails.bread",
            //             foreignField: "_id",
            //             as: "breadIdDetails"
            //         }
            //     },
            //     { $unwind: "$breadIdDetails" },
            //     {
            //         $group: {
            //             _id: "$_id",
            //             order: { $first: "$order" },
            //             breads: {
            //                 $push: {
            //                     breadId: {
            //                         _id: "$breadIdDetails._id",
            //                         title: "$breadIdDetails.title",
            //                         price: "$breadIdDetails.price",
            //                         price2: "$breadIdDetails.price2",
            //                         price3: "$breadIdDetails.price3",
            //                         price4: "$breadIdDetails.price4",
            //                         createdAt: "$breadIdDetails.createdAt"
            //                     },
            //                     quantity: "$order.typeOfBreadIds.quantity",
            //                     _id: "$breadDetails._id"
            //                 }
            //             }
            //         }
            //     },
            //     {
            //         $project: {
            //             _id: 1,
            //             order: {
            //                 _id: "$order._id",
            //                 typeOfBreadIds: "$breads",
            //                 description: "$order.description",
            //                 quantity: "$order.quantity",
            //                 pricetype: "$order.pricetype",
            //                 createdAt: "$order.createdAt"
            //             }
            //         }
            //     }
            // ])

        }
        returnedPro = returnedPro.reduce((a, b) => {
            const excite = a.find((i) => String(i._id) === String(b._id))
            if (!excite) {
                a.push({ ...b })
            }
            return a
        }, [])
        await setCache(`returnedPro${req.use.id}`, returnedPro)
        return res.status(200).json({
            success: true,
            message: "list of returned products",
            returnedPro: returnedPro
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
        const returnedPro = await ReturnedProModel.findByIdAndUpdate(req.params.id, { status: false }, { new: true })

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
