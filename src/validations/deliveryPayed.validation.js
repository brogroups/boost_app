const Joi = require("joi");

const createDeliverySchema = Joi.object({
    deliveryId: Joi.string().required(),
    price: Joi.number().required(),
    statusId: Joi.string().required(),
    typeId: Joi.string().required(),
})

const updateDeliverySchema = Joi.object({
    deliveryId: Joi.string().required(),
    price: Joi.number().required(),
    statusId: Joi.string().required(),
    typeId: Joi.string().required(),
})

module.exports = { createDeliverySchema, updateDeliverySchema }