const TypeOfWareHouse = require("../models/typeofwarehouse.model")

exports.createTypeOfWareHouse = async (req, res) => {
    try {
        const typeOfWareHouse = await TypeOfWareHouse.create(req.body)
        return res.status(201).json({
            success: true,
            message: "type of warehouse created",
            typeOfWareHouse
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getTypeOfWareHouse = async (req, res) => {
    try {
        const typeOfWareHouses = await TypeOfWareHouse.find({})
        return res.status(200).json({
            success: true,
            message: "list of type of ware houses",
            typeOfWareHouses
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getTypeOfWareHouseById = async (req, res) => {
    try {
        const typeOfWareHouse = await TypeOfWareHouse.findById(req.params.id)
        if (!typeOfWareHouse) {
            return res.status(404).json({
                success: false,
                message: "type of ware house not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of type ware house",
            typeOfWareHouse
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateTypeOfWareHouse = async (req, res) => {
    try {
        const typeOfWareHouse = await TypeOfWareHouse.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!typeOfWareHouse) {
            return res.status(404).json({
                success: false,
                message: "type of ware house not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "type ware house updated",
            typeOfWareHouse
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteTypeOfWareHouse = async (req, res) => {
    try {
        const typeOfWareHouse = await TypeOfWareHouse.findByIdAndDelete(req.params.id)
        if (!typeOfWareHouse) {
            return res.status(404).json({
                success: false,
                message: "type of ware house not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "type ware house deleted",
            typeOfWareHouse
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}