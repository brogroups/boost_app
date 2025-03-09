const Joi = require("joi");

const CreateDeliveryDebtSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    deliveryId: Joi.string().optional(),
    
})

const UpdateDeliveryDebtSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    deliveryId: Joi.string().optional(),
})

module.exports = { CreateDeliveryDebtSchema, UpdateDeliveryDebtSchema }