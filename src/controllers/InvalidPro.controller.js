const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose")
const InvalidProModel = require("../models/InvalidPro.model")


exports.create = async (req, res) => {
    try {
        let invalidPro = null;
        switch (req.use.role) {
            case "manager":
                invalidPro = await InvalidProModel.create({ ...req.body, managerId: new mongoose.Types.ObjectId(req.use.id) })
                break;
        }
        await deleteCache(`InvalidPro${req.use.id}`)
        // await deleteCache(`sellerBread`)
        return res.status(201).json({
            status: true,
            invalidPro
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
        let InvalidPro = await InvalidProModel.aggregate([
            { $match: {} },
            {
                $lookup: {
                    from: "returnedpros",
                    localField: "ReturnedModel",
                    foreignField: "_id",
                    as: "returned"
                }
            },
            {
                $unwind: "$returned"
            },
            {
                $lookup: {
                    from: "orderwithdeliveries",
                    localField: "returned.orderWithDelivery",
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
                $lookup: {
                    from: "deliveries",
                    localField: "order.deliveryId",
                    foreignField: "_id",
                    as: "delivery"
                }
            },
            {
                $unwind: "$delivery"
            },
            {
                $project: {
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
                        title: "$breadDetails.title",

                        totalQuantity: 1
                    },
                }
            }
        ])
        InvalidPro = InvalidPro.map((item) => {
            return { ...item, totalPrice: item?.order.typeOfBreadIds?.reduce((a, b) => a + (item.pricetype === 'tan' ? b.breadId.price : item.pricetype === 'narxi' ? b.breadId.price2 : item.pricetype === 'toyxona' ? b.breadId.price3 : b.breadId.price) * b.quantity, 0) }
        })
        // await setCache(`InvalidPro${req.use.id}`,InvalidPro)
        return res.status(200).json({
            success: true,
            InvalidPro
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

        await deleteCache(`InvalidPro${req.use.id}`)

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


        await deleteCache(`InvalidPro${req.use.id}`);


    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
