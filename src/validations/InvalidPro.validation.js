const Joi = require("joi");

const createSchema = Joi.object({
    orderWithDelivery: Joi.array().required(),
})

const updateSchema = Joi.object({
    orderWithDelivery: Joi.array().required(),
})

module.exports = { createSchema, updateSchema }