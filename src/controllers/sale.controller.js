const { default: mongoose } = require("mongoose");
const { setCache, getCache, deleteCache } = require("../helpers/redis.helper");
const SaleModel = require("../models/sale.mode");
const SellerBreadModel = require("../models/sellerBread.model");

exports.create = async (req, res) => {
    try {
        for (const key of req.body.typeOfBreadIds) {
            let typeOfWareHouse = await SellerBreadModel.findById(key.bread);
            if (!typeOfWareHouse) {
                return res.status(404).json({
                    success: false,
                    message: `Mahsulot topilmadi (ID: ${key.omborxonaProId})`
                });
            }

            if (key.quantity > typeOfWareHouse.totalQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Yetarli mahsulot mavjud emas. Ombordagi miqdor: ${typeOfWareHouse.totalQuantity}`
                });
            }

            typeOfWareHouse.totalQuantity -= key.quantity;
            await SellerBreadModel.findByIdAndUpdate(
                key.bread,
                { totalQuantity: typeOfWareHouse.totalQuantity },
                { new: true }
            );
        }
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
        const cache = await getCache(`sale${req.use.id}`)
        if (!cache) {
            return res.status(200).json({
                success: true,
                sales: cache?.reverse()
            })
        }
        const sales = await SaleModel.aggregate([
            { $match: { managerId: new mongoose.Types.ObjectId(req.use.id), status: true } },
            {
                $lookup: {
                    from: "sellerbread",
                    localField: "breadId",
                    foreignField: "_id",
                    as: "bread"
                }
            }, {
                $unwind: "$bread"
            }, {
                $project: {
                    _id: 1,
                    breadId: "$bread",
                    saleBread: 1,
                    money: 1,
                    remainquantity: 1,
                    description: 1,
                    managerId: 1,
                    createdAt: 1
                }
            }
        ])
        await setCache(`sale${req.use.id}`, sales)
        return res.status(200).json({
            success: true,
            sales: cache?.reverse()
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
exports.update = async () => {
    try {
        const sale = await SaleModel.findByIdAndUpdate(req.params.id, { ...req.body, createdAt: new Date() }, { new: true })
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            })
        }
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
exports.destroy = async () => {
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