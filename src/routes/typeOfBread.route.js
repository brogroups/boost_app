const { Router } = require("express")
const router = Router()

const Controller = require("../controllers/typeOfBread.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")

const { CreateTypeOfBreadSchema, UpdateTypeOfBreadSchema } = require("../validations/typeOfBread.validation")

router.post("/typeOfBread", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]), Middleware.verifyValidation(CreateTypeOfBreadSchema), Controller.createTypeOfBread)
router.get("/typeOfBreads", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),  Controller.getTypeOfBread)
router.get("/typeOfBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),  Controller.getTypeOfBreadById)
router.put("/typeOfBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Middleware.verifyValidation(UpdateTypeOfBreadSchema),  Controller.updateTypeOfBread)
router.delete("/typeOfBread/:id", Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),  Controller.deleteTypeOfBread)

module.exports = router