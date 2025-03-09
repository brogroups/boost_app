const { getCache, setCache, deleteCache } = require("../helpers/redis.helper")
const TypeOfDebtModel = require("../models/typeOfDebt.model")

exports.createTypeOfDebt = async (req, res) => {
    try {
        const { title, price, quantity } = req.body
        const newTypeOfDebt = await TypeOfDebtModel.create({
            title,
            price,
            quantity,
            version: 1
        })
        await deleteCache(`typeOfDebt`)
        
        return res.status(201).json({
            success: true,
            message: "new type of debt created",
            typeOfDebt: newTypeOfDebt
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getTypeOfDebt = async (req, res) => {
    try {
        const cache = await getCache(`typeOfDebt`)
        if(cache){
            return res.status(200).json({
                success: true,
                message: "list of type of debts",
                typeOfDebts:cache
            })
        }
        const typeOfDebts = await TypeOfDebtModel.find({})
        await setCache(`typeOfDebt`,typeOfDebts.reverse())
        return res.status(200).json({
            success: true,
            message: "list of type of debts",
            typeOfDebts:typeOfDebts.reverse()
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getTypeOfDebtById = async (req, res) => {
    try {
        const typeOfDebt = await TypeOfDebtModel.findById(req.params.id)
        if (!typeOfDebt) {
            return res.status(404).json({
                success: false,
                message: "type of debt not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of type of debt",
            typeOfDebt
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateTypeOfDebt = async (req, res) => {
    try {
        const { title, price, quantity } = req.body
        const typeOfDebt = await TypeOfDebtModel.findByIdAndUpdate(req.params.id, { title, price, quantity, updateAt: new Date() }, { new: true })
        if (!typeOfDebt) {
            return res.status(404).json({
                success: false,
                message: "type of debt not found"
            })
        }
        await deleteCache(`typeOfDebt`)
        return res.status(200).json({
            success: true,
            message: "type of debt updated",
            typeOfDebt
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteTypeOfDebt = async (req, res) => {
    try { 
        const typeOfDebt = await TypeOfDebtModel.findByIdAndDelete(req.params.id)
        if (!typeOfDebt) {
            return res.status(404).json({
                success: false,
                message: "type of debt not found"
            })
        }
        await deleteCache(`typeOfDebt`)
        return res.status(200).json({
            success: true,
            message: "type of debt deleted",
            typeOfDebt
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}