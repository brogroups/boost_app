const Debt1Model = require("../models/debt1.model")

exports.createDebt1 = async (req, res) => {
    try {
        const { title, quantity, sellerBreadId, reason } = req.body
        const newDebt1 = await Debt1Model.create({ title, quantity, sellerBreadId, reason })
        return res.status(201).json({
            success: true,
            message: "debt created",
            debt: newDebt1
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getDebt1s = async (req, res) => {
    try {
        const debt1s = await Debt1Model.find({}).populate("sellerBreadId")
        return res.status(200).json({
            success: true,
            message: "list of debt1s",
            debt1s
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getDebt1ById = async (req, res) => {
    try {
        const debt1 = await Debt1Model.findById(req.params.id).populate("sellerBreadId")
        if (!debt1) {
            return res.status(404).json({
                success: false,
                message: "debts not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of debt1",
            debt1
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateDebt1ById = async (req, res) => {
    try {
        const { title, quantity, sellerBreadId, reason } = req.body
        const debt1 = await Debt1Model.findByIdAndUpdate(req.params.id, { title, quantity, sellerBreadId, reason, updateAt: new Date() }, { new: true }).populate("sellerBreadId")
        if (!debt1) {
            return res.status(404).json({
                success: false,
                message: "debts not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "debt1 updated",
            debt1
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.deleteDebt1ById = async (req, res) => {
    try {
        const debt1 = await Debt1Model.findByIdAndDelete(req.params.id)
        if (!debt1) {
            return res.status(404).json({
                success: false,
                message: "debts not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "debt1 deleted",
            debt1
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}