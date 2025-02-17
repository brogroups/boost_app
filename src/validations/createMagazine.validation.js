const Joi = require("joi");

const CreatecreateMagazineSchema = Joi.object({
    owner: Joi.string().required(),
    phone: Joi.string().required().pattern(/^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/),
    address: Joi.string().required(),
    avarageBread: Joi.number().required(),
    DeliveryId: Joi.string().required(),
})

const UpdatecreateMagazineSchema = Joi.object({
    owner: Joi.string().required(),
    phone: Joi.string().required().pattern(/^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/),
    address: Joi.string().required(),
    avarageBread: Joi.number().required(),
    DeliveryId: Joi.string().required(),
})


module.exports = { CreatecreateMagazineSchema, UpdatecreateMagazineSchema }