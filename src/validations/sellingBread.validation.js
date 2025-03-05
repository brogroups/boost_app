const Joi = require("joi");

const CreateSellingBreadSchema = Joi.object({
    typeOfBreadIds: Joi.array().required(),
    quantity: Joi.number().required(),
    paymentMethod: Joi.string().required(),
    deliveryId: Joi.string().required(),
    magazineId: Joi.string().required(),
    money: Joi.number().required(),
})

const UpdateSellingBreadSchema = Joi.object({
    typeOfBreadIds: Joi.array().required(),
    quantity: Joi.number().required(),
    paymentMethod: Joi.string().required(),
    deliveryId: Joi.string().required(),
    magazineId: Joi.string().required(),
    money: Joi.number().required(),
})

module.exports = {CreateSellingBreadSchema,UpdateSellingBreadSchema}