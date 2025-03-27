const Joi = require("joi");

const CreateOrderWithDeliverySchema = Joi.object({
    typeOfBreadIds: Joi.array().required(),
    pricetype: Joi.string().required(),
    // quantity: Joi.number().required(),
    pricetype: Joi.string().required(),
    description: Joi.string().required(),
    sellerId: Joi.string().optional(),
    deliveryId: Joi.string().required(),
    type: Joi.string().optional(),
    totalQuantity: Joi.number().optional()
    // magazineId: Joi.string().required()
})

const UpdateOrderWithDeliverySchema = Joi.object({
    typeOfBreadIds: Joi.array().required(),
    pricetype: Joi.string().required(),
    // quantity: Joi.number().required(),
    description: Joi.string().required(),
    sellerId: Joi.string().optional(),
    deliveryId: Joi.string().required(),
    // magazineId: Joi.string().required()
})

module.exports = { CreateOrderWithDeliverySchema, UpdateOrderWithDeliverySchema }