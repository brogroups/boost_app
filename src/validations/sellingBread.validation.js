const Joi = require("joi");

const CreateSellingBreadSchema = Joi.object({
    breadId: Joi.string().required(),
    bread: Joi.string().required(),
    quantity: Joi.number().required(),
    paymentMethod: Joi.string().required(),
    deliveryId: Joi.string().optional(),
    magazineId: Joi.string().required(),
    money: Joi.number().required(),
    pricetype: Joi.string().required(),
})

const UpdateSellingBreadSchema = Joi.object({
    breadId: Joi.string().required(),
    bread: Joi.string().required(),
    quantity: Joi.number().required(),
    paymentMethod: Joi.string().required(),
    deliveryId: Joi.string().optional(),
    magazineId: Joi.string().required(),
    money: Joi.number().required(),
    pricetype: Joi.string().required(),
})

module.exports = { CreateSellingBreadSchema, UpdateSellingBreadSchema }