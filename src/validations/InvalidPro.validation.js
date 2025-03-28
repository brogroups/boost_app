const Joi = require("joi");

const createSchema = Joi.object({
    ReturnedModel: Joi.string().required(),
})

const updateSchema = Joi.object({
    ReturnedModel: Joi.string().required(),
})

module.exports = { createSchema, updateSchema }