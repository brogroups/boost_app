const {Router} = require("express")
const router = Router()

const Controller = require("../controllers/sellerPayed.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")
const SellerModel = require("../models/seller.model")

const {createSelleyPayedSchema,updateSelleyPayedSchema} = require("../validations/sellerPayed.validation")

router.post("/sellerPayed",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel,SellerModel]),Middleware.verifyValidation(createSelleyPayedSchema),Controller.createSelleryPayed)
router.get('/sellerPayeds',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.getSellerPayed)
router.get('/sellerPayed/:id',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.getSellerPayedById)
router.put('/sellerPayed/:id',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Middleware.verifyValidation(updateSelleyPayedSchema),Controller.updateSellerById)
router.delete('/sellerPayed/:id',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.deleteSellerPayed)

module.exports = router