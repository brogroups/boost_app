const Joi = require("joi");

const CreateSaleSchema = new Joi.object({
    breadId: Joi.string().required(),
    money: Joi.number().required(),
    quantity: Joi.number().required(),
    description: Joi.string().required(),
    pricetype: Joi.string().required(),
})

const UpdateSaleSchema = new Joi.object({
    breadId: Joi.string().required(),
    money: Joi.number().required(),
    quantity: Joi.number().required(),
    description: Joi.string().required(),
    pricetype: Joi.string().required(),
})

module.exports = {CreateSaleSchema,UpdateSaleSchema}