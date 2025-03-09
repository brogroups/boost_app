const Joi = require("joi");

const CreateDeliveryDebtSchema = Joi.object({
    // reason: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    deliveryId: Joi.string().optional(),
    
})

const UpdateDeliveryDebtSchema = Joi.object({
    // reason: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    deliveryId: Joi.string().optional(),
})

module.exports = { CreateDeliveryDebtSchema, UpdateDeliveryDebtSchema }