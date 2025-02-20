const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/delivery.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const DeliveryModel = require("../models/delivery.model")
const SellerModel = require("../models/seller.model")

const { CreateDeliverySchema, UpdateDeliverySchema, LoginDeliverySchema } = require("../validations/delivery.validation")
const ManagerModel = require("../models/manager.model")



router.post("/delivery", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]), Middleware.verifyValidation(CreateDeliverySchema), Controller.createDelivery)
router.post("/delivery/login",Middleware.verifyValidation(LoginDeliverySchema),Controller.loginDelivery)
router.get("/delivery/token",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel,DeliveryModel,SellerModel]),Controller.getDeliveryByToken)
router.get("/deliveries",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]),Controller.getDeliveries)
router.get("/delivery/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel,DeliveryModel,SellerModel]),Controller.getDeliveryById)
router.put("/delivery/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel,DeliveryModel,SellerModel]),Middleware.verifyValidation(UpdateDeliverySchema),Controller.updateDelivery)
router.delete("/delivery/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]),Controller.deleteDelivery)

module.exports = router