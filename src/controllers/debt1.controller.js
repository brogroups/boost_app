const Debt1Model = require("../models/debt1.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper');
const { default: mongoose } = require("mongoose");

exports.createDebt1 = async (req, res) => {
    try {
        let newDebt1;
        switch (req.use.role) {
            case "seller":
                newDebt1 = await Debt1Model.create({ ...req.body, sellerId: req.use.id })
                break;
            case "superAdmin":
                newDebt1 = await Debt1Model.create(req.body)
                break;
            case "manager":
                newDebt1 = await Debt1Model.create(req.body)
                break;
            default:
                break;
        }
        await deleteCache(`debt1`)
        await deleteCache(`debt2`)
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
                debt1s: cashe?.reverse()
            })
        }
        let debt1s = []
        switch (req.use.role) {
            case "seller":
                debt1s = await Debt1Model.aggregate([
                    { $match: { sellerId: new mongoose.Types.ObjectId(req.use.id) } },
                    {
                        $lookup: {
                            from: "sellers",
                            localField: "sellerId",
                            foreignField: "_id",
                            as: "seller"
                        }
                    },
                    {
                        $unwind: "$seller"
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            quantity: 1,
                            reason: 1,
                            createdAt: 1,
                            seller: {
                                _id: "$seller._id",
                                username: "$seller.username"
                            }
                        }
                    }
                ])
                break;
            case "superAdmin":
                debt1s = (await Debt1Model.find({}).populate("sellerId"))
            case "manager":
                debt1s = (await Debt1Model.find({}).populate("sellerId"))
            default:
                break;
        }
        await setCache(`debt1`, debt1s)
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
        const debt1 = await Debt1Model.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!debt1) {
            return res.status(404).json({
                success: false,
                message: "debts not found"
            })
        }
        await deleteCache(`debt1`)
        await deleteCache(`debt2`)
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
        await deleteCache(`debt2`)
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