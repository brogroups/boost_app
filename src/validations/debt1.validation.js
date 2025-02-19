const Joi = require("joi");

const CreateDebt1Schema = Joi.object({
    title: Joi.string().required(),
    quantity: Joi.number().required(),
    sellerId: Joi.string().required(),
    reason: Joi.string().required(),
})

const UpdateDebt1Schema = Joi.object({
    title: Joi.string().required(),
    quantity: Joi.number().required(),
    sellerId: Joi.string().required(),
    reason: Joi.string().required(),
})

module.exports = { CreateDebt1Schema, UpdateDebt1Schema }