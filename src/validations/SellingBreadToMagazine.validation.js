const Joi = require("joi");

const CreateSellingToBreadMagazineSchema = Joi.object({
    typeOfBreads: Joi.array().required(),
    quantity: Joi.number().required(),
    payedType: Joi.string().required(),
    deliveryId: Joi.string().required(),
    magazineId: Joi.string().required(),
})

const UpdateSellingToBreadMagazineSchema = Joi.object({
    typeOfBreads: Joi.array().required(),
    quantity: Joi.number().required(),
    payedType: Joi.string().required(),
    deliveryId: Joi.string().required(),
    magazineId: Joi.string().required(),
})

module.exports = { CreateSellingToBreadMagazineSchema, UpdateSellingToBreadMagazineSchema }