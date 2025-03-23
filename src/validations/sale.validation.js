const Joi = require("joi");

const CreateSaleSchema = new Joi.object({
    breadId: Joi.string().required(),
    saleBread: Joi.number().required(),
    money: Joi.number().required(),
    remainquantity: Joi.number().required(),
    description: Joi.string().required(),
})

const UpdateSaleSchema = new Joi.object({
    breadId: Joi.string().required(),
    saleBread: Joi.number().required(),
    money: Joi.number().required(),
    remainquantity: Joi.number().required(),
    description: Joi.string().required(),
})

module.exports = {CreateSaleSchema,UpdateSaleSchema}