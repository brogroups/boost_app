const { deleteCache, setCache, getCache } = require("../helpers/redis.helper");
const TypeOfPayedModel = require("../models/typeOfPayed.model");

exports.create = async (req, res) => {
    try {
        const typeOfPayed = await TypeOfPayedModel.create(req.body)
        await deleteCache(`typeOfPayed`)
        return res.status(201).json({
            success: true,
            message: "type of payed created",
            typeOfPayed
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.findAll = async (req, res) => {
    try {
        const typeOfPayedsCache = await getCache(`typeOfPayeds`)
        if (typeOfPayedsCache) {
            return res.status(200).json({
                success: true,
                message: "list of typeOfPayeds",
                typeOfPayeds: typeOfPayedsCache
            })
        }
        const typeOfPayeds = await TypeOfPayedModel.find({}).reverse()
        await setCache(`typeOfPayed`, typeOfPayeds)
        return res.status(200).json({
            success: true,
            message: "list of typeOfPayeds",
            typeOfPayeds
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.findOne = async (req, res) => {
    try {
        const typeOfPayed = await TypeOfPayedModel.findById(req.params.id)
        if (!typeOfPayed) {
            return res.status(404).json({
                success: false,
                message: "type of payed not found",
                typeOfPayed
            })
        }
        return res.status(200).json({
            success: true,
            message: "type of payed found",
            typeOfPayed
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.update = async (req, res) => {
    try {
        const typeOfPayed = await TypeOfPayedModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!typeOfPayed) {
            return res.status(404).json({
                success: false,
                message: "type of payed not found",
            })
        }
        await deleteCache(`typeOfPayed`)
        return res.status(200).json({
            success: true,
            message: "type of payed updated",
            typeOfPayed
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.delete = async (req, res) => {
    try {
        const typeOfPayed = await TypeOfPayedModel.findByIdAndDelete(req.params.id)
        if (!typeOfPayed) {
            return res.status(404).json({
                success: false,
                message: "type of payed not found",
                typeOfPayed
            })
        }
        await deleteCache(`typeOfPayed`)
        return res.status(200).json({
            success: true,
            message: "type of payed deleted",
            typeOfPayed
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}