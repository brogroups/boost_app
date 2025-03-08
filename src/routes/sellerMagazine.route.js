const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/sellerMagazine.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const SellerModel = require("../models/seller.model")
const ManagerModel = require("../models/manager.model")

const { createSchema, updateSchema } = require("../validations/sellerMagazine.validation")


router.post("/sellerMagazine", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Middleware.verifyValidation(createSchema), Controller.create)
router.get("/sellerMagazines", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.findAll)
router.get("/sellerMagazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.findOne)
router.put("/sellerMagazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Middleware.verifyValidation(updateSchema), Controller.update)
router.delete("/sellerMagazine/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel, ManagerModel, SellerModel]), Controller.delete)

module.exports = router