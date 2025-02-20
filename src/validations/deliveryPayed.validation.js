const Joi = require("joi");

const createDeliverySchema = Joi.object({
    deliveryId: Joi.string().required(),
    price: Joi.number().required(),
})

const updateDeliverySchema = Joi.object({
    deliveryId: Joi.string().required(),
    price: Joi.number().required(),
})

module.exports  = {createDeliverySchema,updateDeliverySchema}