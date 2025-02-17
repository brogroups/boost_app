const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/deliveryDebt.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require('../models/superAdmin.model')
const ManagerModel = require('../models/manager.model')
const DeliveryModel = require('../models/delivery.model')

const { CreateDeliveryDebtSchema, UpdateDeliveryDebtSchema } = require("../validations/deliveryDebt.validation")

router.post('/deliveryDebt',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel,ManagerModel,DeliveryModel]),Middleware.verifyValidation(CreateDeliveryDebtSchema),Controller.createDeliveryDebt)
router.get('/deliveryDebts',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel,ManagerModel,DeliveryModel]),Controller.getDeliveryDebt)
router.get('/deliveryDebt/:id',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel,ManagerModel,DeliveryModel]),Controller.getDeliveryDebtById)
router.put('/deliveryDebt/:id',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel,ManagerModel,DeliveryModel]),Middleware.verifyValidation(UpdateDeliveryDebtSchema),Controller.updateDeliveryDebt)
router.delete('/deliveryDebt/:id',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel,ManagerModel,DeliveryModel]),Controller.deleteDeliveryDebt)

module.exports = router