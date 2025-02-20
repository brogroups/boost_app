const Joi = require("joi");

const createSelleyPayedSchema = Joi.object({
    sellerId: Joi.string().required(),
    price: Joi.number().required(),
})

const updateSelleyPayedSchema = Joi.object({
    sellerId: Joi.string().required(),
    price: Joi.number().required(),
})

module.exports  = {createSelleyPayedSchema,updateSelleyPayedSchema}