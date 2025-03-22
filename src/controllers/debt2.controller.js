const Debt2Model = require("../models/debt2.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const { default: mongoose } = require("mongoose");
const TypeOfWareHouseModel = require("../models/typeofwarehouse.model");
const Debt1Model = require("../models/debt1.model");
const DeliveryDebtModel = require("../models/deliveryDebt.model");


exports.createDebt2 = async (req, res) => {
    try {
        let newDebt2;
        if (req.use.role === "manager") {
            newDebt2 = await Debt2Model.create({ ...req.body, managerId: new mongoose.Types.ObjectId(req.use.id )})
        } else if (req.use.role === "superAdmin") {
            newDebt2 = await Debt2Model.create(req.body)
        }
        let typeOfWareHouse = await TypeOfWareHouseModel.findById(newDebt2.omborxonaProId)
        if (typeOfWareHouse) {
            if (typeOfWareHouse.quantity - newDebt2.quantity > 0) {
                await TypeOfWareHouseModel.updateOne({ quantity: typeOfWareHouse.quantity }, { $set: { quantity: typeOfWareHouse.quantity - newDebt2.quantity } })
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Bunday maahsulot omorxonada tugagan"
                })
            }
        }
        await deleteCache(`debt2${req.use.id}`)
        await deleteCache(`typeOfWareHouse`)
        await deleteCache(`warehouse`)
        return res.status(201).json({
            success: true,
            message: "debt2 created",
            debt2: newDebt2
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getDebt2s = async (req, res) => {
    try {
        const cashe = null
        await getCache(`debt2${req.use.id}`)
        if (cashe) {
            return res.status(200).json({
                success: true,
                message: "list of debt2s",
                debt2s: cashe?.reverse()
            })
        }
        let debt2s = []
        let debt1s = []
        let deliveryDebts = []
        let debts = []
        switch (req.use.role) {
            case "manager":
                debt2s = await Debt2Model.aggregate([
                    {
                        $match: {
                            managerId: new mongoose.Types.ObjectId(req.use.id)
                        }
                    },
                    {
                        $lookup: {
                            from: "typeofwarehouses",
                            localField: "omborxonaProId",
                            foreignField: "_id",
                            as: "omborxona"
                        }
                    },
                    {
                        $unwind: "$omborxona"
                    },
                    {
                        $project: {
                            _id: 1,
                            quantity: 1,
                            description: 1,
                            createdAt: 1,
                            omborxonaProId: {
                                _id: "$omborxona._id",
                                name: "$omborxona.name",
                                price: "$omborxona.price",
                            },
                           
                        }
                    }
                ]);
                // debt1s = await Debt1Model.aggregate([
                //     {
                //         $match: {
                //             sellerId: new mongoose.Types.ObjectId(req.use.id)
                //         }
                //     },
                //     {
                //         $lookup: {
                //             from: "sellers",
                //             localField: "sellerId",
                //             foreignField: "_id",
                //             as: "seller"
                //         }
                //     },
                //     {
                //         $unwind: "$seller"
                //     },
                //     {
                //         $project: {
                //             _id: 1,
                //             title: 1,
                //             reason: 1,
                //             price: 1,
                //             quantity: 1,
                //             createdAt: 1,
                //             seller: {
                //                 _id: "$seller._id",
                //                 username: "$seller.username"
                //             }
                //         }
                //     }
                // ])
                debts = [...debt2s]
                break;
            case "superAdmin":
                debt2s = await Debt2Model.find({}).populate("omborxonaProId")
                debt1s = await Debt1Model.find({})
                deliveryDebts = await DeliveryDebtModel.find({}).populate("deliveryId")
                debts = [...debt2s.map((item) => {
                    return { ...item._doc, role: "seller" }
                }), ...debt1s.map((item) => {
                    return { ...item._doc, role: "seller" }
                }), ...deliveryDebts.map((item) => {
                    return { ...item._doc, role: "delivery" }
                })]
                break;
        }
        await setCache(`debt2${req.use.id}`, debts)
        return res.status(200).json({
            success: true,
            message: "list of debt2s",
            debt2s: debts.reverse()
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getDebt2ById = async (req, res) => {
    try {
        const debt2 = await Debt2Model.findById(req.params.id).populate("sellerId omborxonaProId")
        if (!debt2) {
            return res.status(404).json({
                success: false,
                message: "debt2 is not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "details of debt2",
            debt2
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.updateDebt2ById = async (req, res) => {
    try {
        const debt2 = await Debt2Model.findByIdAndUpdate(req.params.id, { ...req.body, updateAt: new Date() }, { new: true })
        if (!debt2) {
            return res.status(404).json({
                success: false,
                message: "debt2 is not found"
            })
        }
        await deleteCache(`debt2${req.use.id}`)
        return res.status(200).json({
            success: true,
            message: "debt2 updated",
            debt2
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



exports.deleteDebt2ById = async (req, res) => {
    try {
        const debt2 = await Debt2Model.findByIdAndDelete(req.params.id)
        if (!debt2) {
            return res.status(404).json({
                success: false,
                message: "debt2 is not found"
            })
        }
        let typeOfWareHouse = await TypeOfWareHouseModel.findById(debt2.omborxonaProId)
        await TypeOfWareHouseModel.updateOne({ quantity: typeOfWareHouse.quantity }, { $set: { quantity: typeOfWareHouse.quantity + debt2.quantity } })
        await deleteCache(`debt2${req.use.id}`)
        await deleteCache(`typeOfWareHouse`)
        await deleteCache(`warehouse`)
        return res.status(200).json({
            success: true,
            message: "debt2 deleted",
            debt2
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}