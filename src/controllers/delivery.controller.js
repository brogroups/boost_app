const DeliveryModel = require("../models/delivery.model");
const DeliveryPayedModel = require("../models/deliveryPayed.model");
const jwt = require("jsonwebtoken");
const { getCache, setCache, deleteCache } = require("../helpers/redis.helper");
const { default: mongoose } = require("mongoose");
const { encrypt } = require("../helpers/crypto.helper");
const SellerModel = require("../models/seller.model");
const SuperAdminModel = require("../models/superAdmin.model");
const ManagerModel = require("../models/manager.model");

exports.createDelivery = async (req, res) => {
    try {
        const { username, phone, price } = req.body;

        const models = [SuperAdminModel, SellerModel, ManagerModel, DeliveryModel]

        for (const model of models) {
            const item = await model.findOne({ username })
            if (item) {
                return res.status(400).json({
                    succes: false,
                    message: "username must be unique"
                })
            }
        }

        const password = phone.slice(-4);
        // const superAdminId = req.use.id;
        const hashPassword = encrypt(password)
        const refreshToken = await jwt.sign(
            { username, password },
            process.env.JWT_TOKEN_REFRESH
        );

        const newDelivery = await DeliveryModel.create({
            username,
            password: hashPassword,
            phone,
            price,
            refreshToken,
            // superAdminId,
        });
        await deleteCache(`delivery`);
        await deleteCache(`debt2`);
        await deleteCache("deliveryPayed");
        await deleteCache("deliveryPayed");
        const accessToken = await jwt.sign(
            { id: newDelivery._id, username: newDelivery.username, role: "delivery" },
            process.env.JWT_TOKEN_ACCESS,
            { expiresIn: "7d" }
        );
        return res.status(201).json({
            success: false,
            message: "delivery created",
            accessToken,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getDeliveries = async (req, res) => {
    try {
        const cashe = await getCache(`delivery`);
        if (cashe) {
            return res.status(200).json({
                success: true,
                message: "list of deliveries",
                deliveries: cashe.reverse(),
            });
        }
        let deliveries = await DeliveryModel.find({});
        const data = [];
        for (const key of deliveries) {
            const deliveryPayedes = await DeliveryPayedModel.aggregate([
                { $match: { deliveryId: key._id } },
            ]);
            let totalPrice = deliveryPayedes.reduce((a, b) => {
                switch (b.type) {
                    case "Bonus":
                        return a + b?.price;
                        break;
                    case "Shtraf":
                        return a - b?.price;
                        break;
                    case "Kunlik":
                        return a + b?.price;
                        break;
                    default:
                        break;
                }
            }, 0);

            data.push({
                ...key._doc,
                deliveryPayed: deliveryPayedes,
                totalPrice,
            })
        }
        await setCache(`delivery`, data);
        return res.status(200).json({
            success: true,
            message: "list of deliveries",
            deliveries: data.reverse(),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getDeliveryById = async (req, res) => {
    try {
        const delivery = await DeliveryModel.findById(req.params.id);
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "details of delivery",
            delivery,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateDelivery = async (req, res) => {
    try {
        const { username, password, phone, price } = req.body;
        let hashPassword;
        if (password) {
            hashPassword = encrypt(password)
        }
        const delivery = await DeliveryModel.findByIdAndUpdate(
            req.params.id,
            { username, password: hashPassword, phone, price, updateAt: new Date() },
            { new: true }
        );
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found",
            });
        }
        await deleteCache(`delivery`);
        return res.status(200).json({
            success: true,
            message: "delivery updated",
            delivery,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteDelivery = async (req, res) => {
    try {
        const delivery = await DeliveryModel.findByIdAndDelete(req.params.id);
        const deliveryPayeds = await DeliveryPayedModel.find({});
        deliveryPayeds.forEach(async () => {
            await DeliveryPayedModel.deleteOne({ deliveryId: delivery._id });
        });
        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found",
            });
        }
        await deleteCache(`delivery`);
        return res.status(200).json({
            success: true,
            message: "delivery deleted",
            delivery,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


