const Joi = require("joi");

const createDeliverySchema = Joi.object({
    deliveryId: Joi.string().required(),
    price: Joi.number().required(),
    status: Joi.string().required(),
    type: Joi.string().required(),
    comment: Joi.string().required(),
})

const updateDeliverySchema = Joi.object({
    deliveryId: Joi.string().required(),
    price: Joi.number().required(),
    status: Joi.string().required(),
    type: Joi.string().required(),
    comment: Joi.string().required(),
})

module.exports = { createDeliverySchema, updateDeliverySchema }