const Joi = require("joi");

const createSelleyPayedSchema = Joi.object({
    sellerId: Joi.string().required(),
    price: Joi.number().required(),
    statusId: Joi.string().required(),
    typeId: Joi.string().required(),
})

const updateSelleyPayedSchema = Joi.object({
    sellerId: Joi.string().required(),
    price: Joi.number().required(),
    statusId: Joi.string().required(),
    typeId: Joi.string().required(),
})

module.exports  = {createSelleyPayedSchema,updateSelleyPayedSchema}