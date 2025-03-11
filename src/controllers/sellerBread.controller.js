const SellerBreadModel = require("../models/sellerBread.model")
const { getCache, setCache, deleteCache } = require("../helpers/redis.helper")
const { default: mongoose } = require("mongoose")


exports.createSellerBread = async (req, res) => {
    try {
        const sellerBread = await SellerBreadModel.create({
            ...req.body,
            sellerId:req.use.id
        })
        await deleteCache(`sellerBread`)
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
        const cache = await getCache(`sellerBread`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of seller breads",
                sellerBreads: cache
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
            data.push({ ...key, price:price * key.quantity })
        }
        await setCache(`sellerBread`, data.reverse())
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