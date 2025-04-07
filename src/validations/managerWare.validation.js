const Joi = require("joi");

const createSchema = Joi.object({
    sellerId: Joi.string().required(),
    bread: Joi.string().required(),
    totalQuantity: Joi.number().required(),
    totalQopQuantity: Joi.number().required(),
})


const updateSchema = Joi.object({
    sellerId: Joi.string().required(),
    bread: Joi.string().required(),
    totalQuantity: Joi.number().required(),
    totalQopQuantity: Joi.number().required(),
})

module.exports = { createSchema, updateSchema }