const { default: mongoose } = require("mongoose");
const { setCache, getCache, deleteCache } = require("../helpers/redis.helper");
const SaleModel = require("../models/sale.mode");
const SellerBreadModel = require("../models/sellerBread.model");

exports.create = async (req, res) => {
    try {
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

        typeOfWareHouse.totalQuantity -= req.body.quantity;
        await SellerBreadModel.findByIdAndUpdate(
            req.body.breadId,
            { totalQuantity: typeOfWareHouse.totalQuantity },
            { new: true }
        );
        switch (req.use.role) {
            case "manager":
                await SaleModel.create({ ...req.body, managerId: new mongoose.Types.ObjectId(req.use.id) })
                break;
            case "superAdmin":
                await SaleModel.create(req.body)
                break;
            default:
                return res.status(403).json({
                    success: false,
                    message: "Ruxsat yo'q"
                });
        }
        await deleteCache(`sale${req.use.id}`)
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
        await getCache(`sale${req.use.id}`)
        if (cache) {
            return res.status(200).json({
                success: true,
                sales: cache?.reverse()
            })
        }

        let sales = await SaleModel.aggregate([
            { $match: { managerId: new mongoose.Types.ObjectId(req.use.id), status: true } },
            {
                $lookup: {
                    from: "sellerbreads",
                    localField: "breadId",
                    foreignField: "_id",
                    as: "bread"
                }
            }, {
                $unwind: "$bread"
            },
            {
                $lookup: {
                    from: "typeofbreads",
                    localField: "bread.typeOfBreadId.breadId",
                    foreignField: "_id",
                    as: "breadId2"
                }
            },
            {
                $unwind: "$breadId2"
            },
            {
                $project: {
                    _id: 1,
                    breadId: {
                        _id: "$bread._id",
                        typeOfBreadId: {
                            $map: {
                                input: "$bread.typeOfBreadId",
                                as: "typeofbread",
                                in: {
                                    breadId: "$breadId2",
                                    quantity: "$$typeofbread.quantity",
                                    qopQuantity: "$$typeofbread.qopQuantity"
                                }
                            }
                        },
                        title: "$bread.title"
                    },
                    money: 1,
                    quantity: 1,
                    description: 1,
                    managerId: 1,
                    createdAt: 1,
                    pricetype: 1
                }
            }
        ])
        sales = sales.map((item) => {
            return { ...item, breadId: { ...item.breadId, totalQuantity: item.breadId.typeOfBreadId.reduce((a, b) => a + b.quantity, 0), totalPrice: item.breadId.typeOfBreadId?.reduce((a, b) => a + (item.pricetype === 'tan' ? b.breadId.price : item.pricetype === 'narxi' ? b.breadId.price2 : item.pricetype === 'toyxona' ? b.breadId.price3 : b.breadId.price) * b.quantity, 0) } }
        })
        await setCache(`sale${req.use.id}`, sales)
        return res.status(200).json({
            success: true,
            sales: sales.reverse()
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
        const sale = await SaleModel.findById(req.params.id)
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "found",
            sale
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
        const sale = await SaleModel.findById(req.params.id)
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
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

        typeOfWareHouse.totalQuantity += sale.quantity;
        typeOfWareHouse.totalQuantity -= req.body.quantity;
        await SellerBreadModel.findByIdAndUpdate(
            req.body.breadId,
            { totalQuantity: typeOfWareHouse.totalQuantity },
            { new: true }
        );
        await SaleModel.findByIdAndUpdate(sale._id, { ...req.body, createdAt: new Date() }, { new: true })
        await deleteCache(`sale${req.use.id}`)
        return res.status(200).json({
            success: true,
            message: "update",
            sale
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
exports.destroy = async (req, res) => {
    try {
        const sale = await SaleModel.findByIdAndUpdate(req.params.id, { status: false }, { new: true })
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            })
        }
        await deleteCache(`sale${req.use.id}`)
        return res.status(200).json({
            success: true,
            message: "deleted",
            sale
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}