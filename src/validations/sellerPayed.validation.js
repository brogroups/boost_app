const Joi = require("joi");

const createSelleyPayedSchema = Joi.object({
    sellerId: Joi.string().required(),
    price: Joi.number().required(),
    status: Joi.string().required(),
    type: Joi.string().required(),
})

const updateSelleyPayedSchema = Joi.object({
    sellerId: Joi.string().required(),
    price: Joi.number().required(),
    status: Joi.string().required(),
    type: Joi.string().required(),
})

module.exports  = {createSelleyPayedSchema,updateSelleyPayedSchema}