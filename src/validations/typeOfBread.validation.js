const Joi = require("joi");

const CreateTypeOfBreadSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
})

const UpdateTypeOfBreadSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
})

module.exports = { CreateTypeOfBreadSchema, UpdateTypeOfBreadSchema }