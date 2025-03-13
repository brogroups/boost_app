const TypeOfWareHouse = require("../models/typeofwarehouse.model")
const { getCache, setCache, deleteCache } = require('../helpers/redis.helper')
const WareHouseModel = require("../models/warehouse.model")
const { createWareHouse } = require("./warehouse.controller")
const Debt2Model = require("../models/debt2.model")
const { default: mongoose } = require("mongoose")

exports.createTypeOfWareHouse = async (req, res) => {
    try {
        const typeOfWareHouse = await TypeOfWareHouse.create(req.body)
        await deleteCache(`typeOfWareHouse`)
        await createWareHouse({ body: { typeId: typeOfWareHouse._id, price: typeOfWareHouse.price, quantity: typeOfWareHouse.quantity } })
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
        const typeOfWareHousesCache = null
        // await getCache("typeOfWareHouse")
        if (typeOfWareHousesCache) {
            return res.status(200).json({
                success: true,
                message: "list of type of ware houses",
                typeOfWareHouses: typeOfWareHousesCache.reverse()
            })
        }
        const typeOfWareHouses = await TypeOfWareHouse.find({})
        let data = []
        for (const key of typeOfWareHouses) {
            const debt = await Debt2Model.aggregate([
                { $match: { omborxonaProId: key._id } },
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
                        quantity: 1,
                        description: 1,
                        omborxonaProId: {
                            _id: "$omborxona._id",
                            name: "$omborxona.name",
                            price: "$omborxona.price",
                        },
                        seller: {
                            _id: "$seller._id",
                            username: "$seller.username"
                        },
                        createdAt: 1,
                    }
                }
            ])

            const warehouses = await WareHouseModel.aggregate([
                { $match: { typeId: key._id } }
            ])

            const history = warehouses.map((item) => {
                return { ...item, totalPrice: item.price * item.quantity, type: "payed" }
            }).concat(debt.map((item) => {
                return { ...item, totalPrice: item.omborxonaProId.price * item.quantity, type: "debt" }
            }))

            const warehouse = history[history.length - 1]
            // let allPrice = warehouses.reduce((a, b) => {
            //     return b.price + a'
            // }, 0)
            // let debtQuantity = null;
            // let payedQuantity = null;
            // let quantity = null;
            debtQuantity = history.reduce((a, b) => {
                return b.type === "debt" ? b.quantity - a : a
            }, 0)

            payedQuantity = history.reduce((a, b) => {
                return b.type === "payed" ? a + b.quantity : a
            }, 0)

            data.push({ ...key._doc, price: warehouse?.price ? warehouse?.price : key.price, history, totalPrice: (warehouse?.price ? warehouse?.price : key.price) * key.quantity })
        }
        data = data.filter((i) => i.quantity > 0)
        await setCache("typeOfWareHouse", data)
        return res.status(200).json({
            success: true,
            message: "list of type of ware houses",
            typeOfWareHouses: data.reverse()
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
        await deleteCache(`typeOfWareHouse`)
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
        await deleteCache(`typeOfWareHouse`)
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