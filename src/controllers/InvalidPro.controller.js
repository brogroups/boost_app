const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose")
const InvalidProModel = require("../models/InvalidPro.model")


exports.create = async (req, res) => {
    try {
        let invalidPro = null;
        switch (req.use.role) {
            case "manager":
                invalidPro = await InvalidProModel.create({ ...req.body, managerId: new mongoose.Types.ObjectId(req.use.id) })
                break;
        }
        await deleteCache(`InvalidPro${req.use.id}`)
        // await deleteCache(`sellerBread`)
        return res.status(200).json({
            status: true,
            invalidPro
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
        const cache = null
        await getCache(`InvalidPro${req.use.id}`)
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "list of order with delivereis",
                returnedPro: cache?.reverse()
            })
        }

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

        await deleteCache(`InvalidPro${req.use.id}`)

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.remove = async (req, res) => {
    try {


        await deleteCache(`InvalidPro${req.use.id}`);


    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
