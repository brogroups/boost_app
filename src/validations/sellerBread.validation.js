const Joi = require("joi");

const CreateSellerBread = Joi.object({
    typeOfBreadId: Joi.array().items(Joi.object({
        breadId: Joi.string(),
        quantity: Joi.number()
    })).required(),
    quantity: Joi.number().required(),
    name: Joi.string().required(),
    ovenId: Joi.string().required(),
})

const UpdateSellerBread = Joi.object({
    typeOfBreadId: Joi.array().items(Joi.object({
        breadId: Joi.string(),
        quantity: Joi.number()
    })).required(),
    quantity: Joi.number().required(),
    name: Joi.string().required(),
    ovenId: Joi.string().required(),
})

module.exports = { CreateSellerBread, UpdateSellerBread }