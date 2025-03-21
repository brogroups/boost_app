const Joi = require("joi");

const CreateMagazineSchema = Joi.object({
    title: Joi.string().required(),
    phone: Joi.string().optional().pattern(/^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/),
    address: Joi.string().required(),
    pending: Joi.number().required(),
})

const UpdateMagazineSchema = Joi.object({
    title: Joi.string().required(),
    phone: Joi.string().optional().pattern(/^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/),
    address: Joi.string().required(),
    pending: Joi.number().required(),
})

const UpdateMagazinePendingSchema = Joi.object({
    pending: Joi.number().required(),
    comment: Joi.string().required(),
    type: Joi.string().required(),
    magazineId: Joi.string().required()
})

module.exports = {CreateMagazineSchema,UpdateMagazineSchema,UpdateMagazinePendingSchema}