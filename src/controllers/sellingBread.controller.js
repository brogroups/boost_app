const SellingBreadModel = require("../models/sellingBread.model")
const { deleteCache, getCache, setCache } = require("../helpers/redis.helper");
const DeliveryModel = require("../models/delivery.model");
const SellerBreadModel = require("../models/sellerBread.model");
const OrderWithDeliveryModel = require("../models/orderWithDelivery.model");
const DeliveryPayedModel = require("../models/deliveryPayed.model");
const ManagerWareModel = require("../models/managerWare.model");
const SellerModel = require("../models/seller.model");
const { default: mongoose } = require("mongoose");



exports.createSellingBread = async (req, res) => {
    try {
        let sellingBread;
        switch (req.use.role) {
            case "superAdmin":
            case "manager": {
                sellingBread = new SellingBreadModel({ ...req.body })
                let delivery = await DeliveryModel.findById(req.body.deliveryId)
                if (delivery) {
                    let typeOfWareHouse = await ManagerWareModel.findById(req.body.breadId);
                    if (!typeOfWareHouse) {
                        return res.status(404).json({
                            success: false,
                            message: `Mahsulot topilmadi`
                        });
                    }

                    if (req.body.quantity > typeOfWareHouse.totalQuantity) {
                        return res.status(400).json({
                            success: false,
                            message: `Yetarli mahsulot mavjud emas. Ombordagi miqdor: ${typeOfWareHouse.totalQuantity}`
                        });
                    }

                    typeOfWareHouse.totalQuantity -= req.body.quantity;

                    let sellers = await SellerModel.aggregate([
                        { $match: { superAdminId: new mongoose.Types.ObjectId(req.use.id), status: true } }
                    ])

                    for (const key of sellers) {
                        let bread = await SellerBreadModel.findOne({ sellerId: key._id, status: true, "typeOfBreadId.breadId": typeOfWareHouse.bread });
                        if (bread) {
                            bread.totalQuantity = (bread?.totalQuantity || 0) - req.body.quantity
                            if (bread?.totalQuantity >= 0) {
                                await bread.save()
                                break;
                            } else {
                                await bread.save()
                            }
                        }
                    }
                    await ManagerWareModel.findByIdAndUpdate(
                        req.body.breadId,
                        { totalQuantity: typeOfWareHouse.totalQuantity },
                        { new: true }
                    );
                    await DeliveryPayedModel.create({ deliveryId: delivery._id, price: typeOfWareHouse.totalQuantity * delivery.price, status: "To`landi", type: "Kunlik", comment: "----" })
                    await sellingBread.save()
                } else {
                    return res.status(404).json({
                        success: false,
                        message: "delivery topilmadi"
                    })
                }
                break;
            }
            case "delivery": {

                sellingBread = new SellingBreadModel({ ...req.body, deliveryId: req.use.id })
                let delivery = await DeliveryModel.findById(sellingBread.deliveryId)
                if (delivery) {
                    let typeOfWareHouse = await OrderWithDeliveryModel.findById(req.body.breadId);
                    if (!typeOfWareHouse) {
                        return res.status(404).json({
                            success: false,
                            message: `Mahsulot topilmadi`
                        });
                    }

                    if (req.body.quantity > typeOfWareHouse.totalQuantity) {
                        return res.status(400).json({
                            success: false,
                            message: `Yetarli mahsulot mavjud emas. Ombordagi miqdor: ${typeOfWareHouse.totalQuantity}`
                        });
                    }

                    typeOfWareHouse.totalQuantity -= req.body.quantity;
                    await OrderWithDeliveryModel.findByIdAndUpdate(
                        req.body.breadId,
                        { totalQuantity: typeOfWareHouse.totalQuantity },
                        { new: true }
                    );
                    await DeliveryPayedModel.create({ deliveryId: delivery._id, price: typeOfWareHouse.totalQuantity * delivery.price, status: "To`landi", type: "Kunlik", comment: "----" })
                    await sellingBread.save()
                } else {
                    return res.status(404).json({
                        success: false,
                        message: "delivery topilmadi"
                    })
                }
                break;
            }
        }
        await deleteCache(`sellingBread`)
        await deleteCache(`sellerBread`)
        await deleteCache(`delivery`)
        await deleteCache(`magazine`)
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
        const cache = null
        await getCache(`sellingBread`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of selling breads",
                sellingBreads: cache?.reverse()
            })
        }
        let sellingBreads = await SellingBreadModel.find({}).populate("deliveryId magazineId").populate({
            path: "breadId",
            populate: { path: "typeOfBreadId.breadId", model: "TypeOfBread" }
        });
        sellingBreads = sellingBreads.map((item) => {
            const price = item?.breadId?.typeOfBreadId?.reduce((a, b) => a + (b?.breadId?.price2 * b.quantity), 0)
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
        const sellingBread = await SellingBreadModel.findById(req.params.id)
        if (!sellingBread) {
            return res.status(404).json({
                success: false,
                message: "selling bread not found"
            })
        }
        let typeOfWareHouse = await SellerBreadModel.findById(req.body.breadId);
        if (!typeOfWareHouse) {
            return res.status(404).json({
                success: false,
                message: `Mahsulot topilmadi (ID: ${typeOfWareHouse.omborxonaProId})`
            });
        }

        if (req.body.quantity > typeOfWareHouse.totalQuantity) {
            return res.status(400).json({
                success: false,
                message: `Yetarli mahsulot mavjud emas. Ombordagi miqdor: ${typeOfWareHouse.totalQuantity}`
            });
        }

        typeOfWareHouse.totalQuantity += sellingBread.quantity;
        typeOfWareHouse.totalQuantity -= req.body.quantity;
        await SellerBreadModel.findByIdAndUpdate(
            req.body.breadId,
            { totalQuantity: typeOfWareHouse.totalQuantity },
            { new: true }
        );
        await SellingBreadModel.findByIdAndUpdate(sellingBread._id, { ...req.body, updateAt: new Date() }, { new: true })
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
        const sellingBread = await SellingBreadModel.findByIdAndDelete(req.params.id)
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