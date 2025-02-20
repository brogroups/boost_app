const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/seller.controller")
const Middleware = require("../middlewares")

const { CreateSellerSchema, UpdateSellerSchema, LoginSellerSchema } = require("../validations/seller.validation")
const SuperAdminModel = require("../models/superAdmin.model")
const SellerModel = require("../models/seller.model")

router.post("/seller", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel]), Middleware.verifyValidation(CreateSellerSchema), Controller.createSeller)
router.post("/seller/login", Middleware.verifyValidation(LoginSellerSchema), Controller.loginSeller)
router.get("/sellers", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel]), Controller.getSellers)
router.get("/seller/token", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, SellerModel]), Controller.getSellerToken)
router.get("/seller/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, SellerModel]), Controller.getSellerById)
router.put("/seller/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, SellerModel]), Middleware.verifyValidation(UpdateSellerSchema), Controller.updateSeller)
router.delete("/seller/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel]), Controller.deleteSeller)

module.exports = router