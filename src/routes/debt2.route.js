const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/debt2.controller")
const Middleware = require("../middlewares")
const SellerModel = require("../models/seller.model")

const { CreateDebt2Schema, UpdateDebt2Schema } = require("../validations/debt2.validation")

router.post("/debt2",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SellerModel]),Middleware.verifyValidation(CreateDebt2Schema),Controller.createDebt2)
router.get("/debt2s",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SellerModel]),Controller.getDebt2s)
router.get("/debt2/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SellerModel]),Controller.getDebt2ById)
router.put("/debt2/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SellerModel]),Middleware.verifyValidation(UpdateDebt2Schema),Controller.updateDebt2ById)
router.delete("/debt2/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SellerModel]),Controller.deleteDebt2ById)

module.exports = router