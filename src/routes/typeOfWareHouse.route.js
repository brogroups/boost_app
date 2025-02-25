const {Router} = require("express")
const router = Router()

const Controller = require("../controllers/typeOfWareHouse.controller")
const Middleware = require("../middlewares")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")

const {CreateTypeOfWarehouseSchema,UpdateTypeOfWarehouseSchema} = require("../validations/typeOfWarehouse.validation")

router.post("/typeOfWareHouse",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Middleware.verifyValidation(CreateTypeOfWarehouseSchema),Controller.createTypeOfWareHouse)
router.get("/typeOfWareHouses",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.getTypeOfWareHouse)
router.get("/typeOfWareHouse/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.getTypeOfWareHouseById)
router.put("/typeOfWareHouse/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Middleware.verifyValidation(UpdateTypeOfWarehouseSchema),Controller.updateTypeOfWareHouse)
router.delete("/typeOfWareHouse/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.deleteTypeOfWareHouse)

module.exports = router