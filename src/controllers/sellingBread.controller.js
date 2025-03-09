const SellingBreadModel = require("../models/sellingBread.model")
const { deleteCache, getCache, setCache } = require("../helpers/redis.helper")

exports.createSellingBread = async (req, res) => {
    try {
        const sellingBread = await SellingBreadModel.create(req.body)
        await deleteCache(`sellingBread`)
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
        const cache = await getCache(`sellingBread`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of selling breads",
                sellingBreads: cache
            })
        }
        let sellingBreads = await SellingBreadModel.find({}).populate("typeOfBreadIds deliveryId magazineId")
        sellingBreads = sellingBreads.map((item) => {
            const price = item.typeOfBreadIds.reduce((a, b) => a + b.price, 0)
            return { ...item._doc, price: price * item.quantity }
        }).reverse()
        await setCache(`sellingBread`,sellingBreads)
        return res.status(200).json({
            success: true,
            message: "list of selling breads",
            sellingBreads
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