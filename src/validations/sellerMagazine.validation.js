const Joi = require("joi");

const createSchema = Joi.object({
    sellerBreadId: Joi.string().required(),
    sellerId: Joi.string().optional(),
    quantity: Joi.number().required(),
    price: Joi.number().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
})


const updateSchema = Joi.object({
    sellerBreadId: Joi.string().required(),
    sellerId: Joi.string().optional(),
    quantity: Joi.number().required(),
    price: Joi.number().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
})

module.exports = { createSchema, updateSchema }