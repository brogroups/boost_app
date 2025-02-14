const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/typeOfBread.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")

const { CreateTypeOfBreadSchema, UpdateTypeOfBreadSchema } = require("../validations/typeOfBread.validation")

router.post("/typeOfBread", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel]), Middleware.verifyValidation(CreateTypeOfBreadSchema), Controller.createTypeOfBread)
router.get("/typeOfBreads", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel]),  Controller.getTypeOfBread)
router.get("/typeOfBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel]),  Controller.getTypeOfBreadById)
router.put("/typeOfBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel]),Middleware.verifyValidation(UpdateTypeOfBreadSchema),  Controller.updateTypeOfBread)
router.delete("/typeOfBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorretRole([SuperAdminModel]),  Controller.deleteTypeOfBread)

module.exports = router