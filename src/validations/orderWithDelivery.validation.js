const Joi = require("joi");

const CreateOrderWithDeliverySchema = Joi.object({
    typeOfBreadIds: Joi.array().required(),
    quantity: Joi.number().required(),
    description: Joi.string().required(),
    sellerBreadId: Joi.string().required(),
    time: Joi.date().optional(),
})

const UpdateOrderWithDeliverySchema = Joi.object({
    typeOfBreadIds: Joi.array().required(),
    quantity: Joi.number().required(),
    description: Joi.string().required(),
    sellerBreadId: Joi.string().required(),
    time: Joi.date().optional(),
})

module.exports = { CreateOrderWithDeliverySchema, UpdateOrderWithDeliverySchema }