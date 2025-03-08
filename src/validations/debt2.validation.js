const Joi = require("joi");

const CreateDebt2Schema = Joi.object({
    omborxonaProId: Joi.string().required(),
    quantity: Joi.number().required(),
    description: Joi.string().required(),
    // reason: Joi.string().required(),
    sellerId: Joi.string().optional(),
    price: Joi.number().required()
})

const UpdateDebt2Schema = Joi.object({
    omborxonaProId: Joi.string().required(),
    quantity: Joi.number().required(),
    description: Joi.string().required(),
    // reason: Joi.string().required(),
    sellerId: Joi.string().optional(),
    price: Joi.number().required()

})

module.exports = { CreateDebt2Schema, UpdateDebt2Schema }