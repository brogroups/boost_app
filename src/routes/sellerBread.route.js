const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/sellerBread.controller")
const Middleware = require("../middlewares")

const { CreateSellerBread, UpdateSellerBread } = require("../validations/sellerBread.validation")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")

router.post("/sellerBread", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel]), Middleware.verifyValidation(CreateSellerBread), Controller.createSellerBread)
router.get("/sellerBreads", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel]), Controller.getSellerBread)
router.get("/sellerBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel]), Controller.getSellerById)
router.put("/sellerBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Middleware.verifyValidation(UpdateSellerBread), Controller.updateSellerById)
router.delete("/sellerBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS), Middleware.isCorrectRole([SuperAdminModel,ManagerModel]), Controller.deleteSellerById)

module.exports = router