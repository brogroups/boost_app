const Joi = require("joi");

const CreateTypeOfDebtSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    version: Joi.number(),
})

const UpdateTypeOfDebtSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    version: Joi.number(),
})

module.exports = {CreateTypeOfDebtSchema,UpdateTypeOfDebtSchema}