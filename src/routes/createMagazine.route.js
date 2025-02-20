const { Router } = require('express')
const router = Router()

const Controller = require('../controllers/createMagazine.controller')
const Middleware = require('../middlewares')
const ManagerModel = require('../models/manager.model')
const SuperAdminModel = require('../models/superAdmin.model')
const DeliveryModel = require('../models/delivery.model')

const { CreatecreateMagazineSchema, UpdatecreateMagazineSchema } = require('../validations/createMagazine.validation')


router.post('/createMagazine', Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Middleware.verifyValidation(CreatecreateMagazineSchema), Controller.createCreateMagazine)
router.get('/createMagazines', Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Controller.getCreateMagazine)
router.get('/createMagazine/:id', Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Controller.getCreateMagazineById)
router.put('/createMagazine/:id', Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Middleware.verifyValidation(UpdatecreateMagazineSchema), Controller.updateCreateMagazine)
router.delete('/createMagazine/:id', Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]),  Controller.deleteCreateMagazine)

module.exports = router