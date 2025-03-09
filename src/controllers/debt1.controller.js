const Debt1Model = require("../models/debt1.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')

exports.createDebt1 = async (req, res) => {
    try {
        const newDebt1 = await Debt1Model.create(req.body)
        await deleteCache(`debt1`)
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
        const cashe = await getCache(`debt1`)
        if (cashe) {
            return res.status(200).json({
                success: true,
                message: "list of debt1s",
                debt1s: cashe
            })
        }
        const debt1s = (await Debt1Model.find({}).populate("sellerId"))
        await setCache(`debt1`,debt1s.reverse())
        return res.status(200).json({
            success: true,
            message: "list of debt1s",
            debt1s:debt1s.reverse()
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
        const debt1 = await Debt1Model.findById(req.params.id).populate("sellerId")
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
        const debt1 = await Debt1Model.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true }).populate("sellerBreadId")
        if (!debt1) {
            return res.status(404).json({
                success: false,
                message: "debts not found"
            })
        }
        await deleteCache(`debt1`)
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
        await deleteCache(`debt1`)
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