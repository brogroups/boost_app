const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/InvalidPro.controller")
const Middleware = require("../middlewares")
// const SellerModel = require("../models/seller.model")
const ManagerModel = require("../models/manager.model")
const SuperAdminModel = require("../models/superAdmin.model")

const DeliveryModel = require("../models/delivery.model")
const { createSchema, updateSchema } = require("../validations/InvalidPro.validation")


router.post("/InvalidPro", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Middleware.verifyValidation(createSchema), Controller.create)
router.get("/InvalidPros", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Controller.findAll)
router.get("/InvalidPro/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Controller.findOne)
router.put("/InvalidPro/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Middleware.verifyValidation(updateSchema), Controller.update)
router.delete("/InvalidPro/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.remove)

module.exports = router