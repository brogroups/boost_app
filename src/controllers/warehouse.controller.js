const WareHouseModel = require("../models/warehouse.model")

exports.createWareHouse = async (req, res) => {
    try {
        const warehouse = await WareHouseModel.create(req.body)
        return res.status(201).json({
            success: true,
            message: "ware house created",
            warehouse
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getWareHouses = async (req, res) => {
    try {
        const warehouses = await WareHouseModel.find({}).populate("typeId")
        return res.status(200).json({
            success: true,
            message: "list of ware houses",
            warehouses
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getWareHouseById = async (req, res) => {
    try {
        const warehouse = await WareHouseModel.findById(req.params.id).populate("typeId")
        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: "warehouse not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of warehouse",
            warehouse
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateWareHouse = async (req, res) => {
    try {
        const warehouse = await WareHouseModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: "warehouse not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "warehouse updated",
            warehouse
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteWareHouse = async (req, res) => {
    try {
        const warehouse = await WareHouseModel.findByIdAndDelete(req.params.id)
        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: "warehouse not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "warehouse deleted",
            warehouse
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}