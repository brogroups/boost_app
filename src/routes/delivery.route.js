const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/delivery.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const DeliveryModel = require("../models/delivery.model")
const SellerModel = require("../models/seller.model")
const ManagerModel = require("../models/manager.model")

const { CreateDeliverySchema, UpdateDeliverySchema, LoginDeliverySchema } = require("../validations/delivery.validation")

router.post("/delivery", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Middleware.verifyValidation(CreateDeliverySchema), Controller.createDelivery)
router.get("/deliveries", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.getDeliveries)
router.get("/delivery/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel, SellerModel]), Controller.getDeliveryById)
router.put("/delivery/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Middleware.verifyValidation(UpdateDeliverySchema), Controller.updateDelivery)
router.delete("/delivery/history/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.deleteDeliveryHistory)
router.delete("/delivery/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.deleteDelivery)
module.exports = router