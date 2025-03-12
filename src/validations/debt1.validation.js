const Joi = require("joi");

const CreateDebt1Schema = Joi.object({
    title: Joi.string().required(),
    quantity: Joi.number().required(),
    sellerId: Joi.string().optional(),
    reason: Joi.string().required(),
    price: Joi.number().required()
})

const UpdateDebt1Schema = Joi.object({
    title: Joi.string().required(),
    quantity: Joi.number().required(),
    sellerId: Joi.string().optional(),
    reason: Joi.string().required(),
    price: Joi.number().required()
})

module.exports = { CreateDebt1Schema, UpdateDebt1Schema }