const Debt1Model = require("../models/debt1.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper');
const { default: mongoose } = require("mongoose");

exports.createDebt1 = async (req, res) => {
    try {
        let newDebt1;
        switch (req.use.role) {
            case "manager":
                newDebt1 = await Debt1Model.create({ ...req.body, managerId: new mongoose.Types.ObjectId(req.use.id) })
                break;
            case "superAdmin":
                newDebt1 = await Debt1Model.create(req.body)
                break;
            default:
                break;
        }
        await deleteCache(`debt1`)
        await deleteCache(`debt2`)
        await deleteCache(`typeOfWareHouse`)
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
        const cashe = null
         await getCache(`debt1`)
        if (cashe) {
            return res.status(200).json({
                success: true,
                message: "list of debt1s",
                debt1s: cashe?.reverse()
            })
        }
        let debt1s = []
        switch (req.use.role) {
            case "manager":
                debt1s = await Debt1Model.aggregate([
                    { $match: { managerId: new mongoose.Types.ObjectId(req.use.id) } },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            quantity: 1,
                            price: 1,
                            reason: 1,
                            createdAt: 1,
                        }
                    }
                ])
                break;
            case "superAdmin":
                debt1s = await Debt1Model.find({})
                break;
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
        const debt1 = await Debt1Model.findById(req.params.id)
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