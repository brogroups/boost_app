const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/returnedPro.controller")
const Middleware = require("../middlewares")
// const SellerModel = require("../models/seller.model")
const ManagerModel = require("../models/manager.model")
const SuperAdminModel = require("../models/superAdmin.model")

const DeliveryModel = require("../models/delivery.model")
const { CreateReturnProSchema, UpdateReturnedProSchema } = require("../validations/returnedPro.validation")


router.post("/returnedPro", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Middleware.verifyValidation(CreateReturnProSchema), Controller.create)
router.get("/returnedPros", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Controller.findAll)
router.get("/returnedPro/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, DeliveryModel]), Controller.findOne)
router.put("/returnedPro/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Middleware.verifyValidation(UpdateReturnedProSchema), Controller.update)
router.delete("/returnedPro/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel]), Controller.remove)

module.exports = router