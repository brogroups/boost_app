const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/sellerBread.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")
const SellerModel = require("../models/seller.model")

const { CreateSellerBread, UpdateSellerBread } = require("../validations/sellerBread.validation")

router.post("/sellerBread", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]), Middleware.verifyValidation(CreateSellerBread), Controller.createSellerBread)
router.get("/sellerBreads", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]), Controller.getSellerBread)
router.get("/sellerBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]), Controller.getSellerById)
router.put("/sellerBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]),Middleware.verifyValidation(UpdateSellerBread), Controller.updateSellerById)
router.delete("/sellerBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]), Controller.deleteSellerById)

module.exports = router