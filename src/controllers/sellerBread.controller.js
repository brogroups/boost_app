const SellerBreadModel = require("../models/sellerBread.model")
const { getCache, setCache, deleteCache } = require("../helpers/redis.helper")
const { default: mongoose } = require("mongoose")
const { createSelleryPayed } = require("./sellerPayed.controller")


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
        const sellerBreads = await SellerBreadModel.aggregate([
            { $match: { sellerId: new mongoose.Types.ObjectId(req.use.id) } },
        ])
        const populatedSellerBreads = await SellerBreadModel.populate(sellerBreads, {
            path: 'typeOfBreadId.breadId',
            model: 'TypeOfBread'
        });
        const data = []
        for (const key of populatedSellerBreads) {
            const price = key.typeOfBreadId.reduce((a, b) => a + (b?.breadId?.price * b.quantity), 0)
            const totalQuantity = key.typeOfBreadId.reduce((a, b) => a + b.quantity, 0)
            const totalQopQuantity = key.typeOfBreadId.reduce((a, b) => a + b.quantity, 0)
            data.push({ ...key, price, totalQuantity, totalQopQuantity })
        }
        await setCache(`sellerBread`, data)
        return res.status(200).json({
            success: true,
            message: "list of seller breads",
            sellerBreads: data.reverse()
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