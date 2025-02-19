const Joi = require("joi");

const CreateSellerBread = Joi.object({
    typeOfBreadId: Joi.string().required(),
    quantity: Joi.number().required(),
    time: Joi.date().optional(),
    name: Joi.string().required(),
    ovenId: Joi.string().required(),
})

const UpdateSellerBread = Joi.object({
    typeOfBreadId: Joi.string().required(),
    quantity: Joi.number().required(),
    time: Joi.date().optional(),
    name: Joi.string().required(),
    ovenId: Joi.string().required(),
})

module.exports = { CreateSellerBread, UpdateSellerBread }