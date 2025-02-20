const {Router} = require("express")
const router = Router()

const Controller = require("../controllers/deliveryPayed.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const DeliveryModel = require("../models/delivery.model")
const ManagerModel = require("../models/manager.model")

const {createDeliverySchema,updateDeliverySchema} = require("../validations/deliveryPayed.validation")

router.post("/deliveryPayed",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel,DeliveryModel]),Middleware.verifyValidation(createDeliverySchema),Controller.createdeliveryPayed)
router.get("/deliveryPayeds",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.getDeliveryPayed)
router.get("/deliveryPayed/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.getdeliveryPayedById)
router.put("/deliveryPayed/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Middleware.verifyValidation(updateDeliverySchema),Controller.updatedeliveryPayedById)
router.delete("/deliveryPayed/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.deletedelivertPayed)

module.exports = router