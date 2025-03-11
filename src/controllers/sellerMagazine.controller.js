const { default: mongoose } = require("mongoose")
const SellerMagazineModel = require("../models/sellerMagazine.model");
const { deleteCache, setCache } = require("../helpers/redis.helper");

exports.create = async (req, res) => {
    try {
        let sellerMagazine;
        if (req.use.role === "superAdmin") {
            sellerMagazine = await SellerMagazineModel.create(req.body)
        } else if (req.use.role === "seller") {
            sellerMagazine = await SellerMagazineModel.create({ ...req.body, sellerId: req.use.id })
        } else {
            return;
        }
        await deleteCache(`sellerMagazine`)
        return res.status(201).json(sellerMagazine)
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
        let sellerMagazines = []
        if (req.use.role === "superAdmin") {
            sellerMagazines = await SellerMagazineModel.find({}).populate({
                path: "sellerBreadId",
                populate: {
                    path: "typeOfBreadId",
                    populate: {
                        path: "breadId"
                    }
                }
            }).populate("sellerId", 'username')
            sellerMagazines = sellerMagazines.map((item) => {
                let totalPrice = item.price * item.quantity
                return { ...item?._doc, totalPrice }
            })
        }
        else if (req.use.role === "seller") {
            sellerMagazines = await SellerMagazineModel.aggregate([
                {
                    $lookup: {
                        from: 'sellerbreads',
                        localField: 'sellerBreadId',
                        foreignField: '_id',
                        as: 'sellerBreadDetails'
                    }
                },
                {
                    $unwind: '$sellerBreadDetails'
                },
                {
                    $lookup: {
                        from: 'breadtypes',
                        localField: 'sellerBreadDetails.typeOfBreadId',
                        foreignField: '_id',
                        as: 'typeOfBreadDetails'
                    }
                },
                {
                    $unwind: '$sellerBreadDetails.typeOfBreadId'
                },
                {
                    $lookup: {
                        from: 'typeofbreads',
                        localField: 'sellerBreadDetails.typeOfBreadId.breadId',
                        foreignField: '_id',
                        as: 'breadDetails'
                    }
                },
                {
                    $unwind: '$breadDetails'
                },
                {
                    $lookup: {
                        from: 'sellers',
                        localField: 'sellerId',
                        foreignField: '_id',
                        as: 'sellerDetails'
                    }
                },
                {
                    $unwind: '$sellerDetails'
                },
                {
                    $project: {
                        sellerBreadId: 1,
                        sellerId: 1,
                        quantity: 1,
                        price: 1,
                        totalPrice: { $multiply: ['$quantity', '$price'] },
                        title: 1,
                        description: 1,
                        'sellerBreadDetails': 1,
                        'breadDetails': { title: 1, price: 1 },
                    }
                }
            ]);
            sellerMagazines = sellerMagazines.map((item) => {
                let totalPrice = item.price * item.quantity
                return { ...item, totalPrice }
            }).reverse()
        }
        await setCache('sellerMagazine',sellerMagazines)
        return res.status(200).json(sellerMagazines.reverse())
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
        const sellerMagazine = await SellerMagazineModel.findById(req.params.id).populate("sellerBreadId").populate("sellerId", 'username')
        if (!sellerMagazine) {
            return res.status(404).json({
                success: false,
                message: "seller magazine not found"
            })
        }
        return res.status(200).json(sellerMagazine)
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
        const sellerMagazine = await SellerMagazineModel.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!sellerMagazine) {
            return res.status(404).json({
                success: false,
                message: "seller magazine not found"
            })
        }
        await deleteCache(`sellerMagazine`)
        return res.status(200).json(sellerMagazine)
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
        const sellerMagazine = await SellerMagazineModel.findByIdAndDelete(req.params.id)
        if (!sellerMagazine) {
            return res.status(404).json({
                success: false,
                message: "seller magazine not found"
            })
        }
        await deleteCache(`sellerMagazine`)
        return res.status(200).json(sellerMagazine)
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}