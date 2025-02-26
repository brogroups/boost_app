const {Router} = require("express")
const router = Router()

const Controller = require("../controllers/warehouse.controller")
const Middleware = require("../middlewares")

const {CreateWareHouseSchema,UpdateWareHouseSchema} = require("../validations/warehouse.validation")
const SuperAdminModel = require("../models/superAdmin.model")
const ManagerModel = require("../models/manager.model")

router.post("/warehouse",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel],Middleware.verifyValidation(CreateWareHouseSchema)),Controller.createWareHouse)
router.get("/warehouses",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.getWareHouses)
router.get("/warehouse/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.getWareHouseById)
router.put("/warehouse/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Middleware.verifyValidation(UpdateWareHouseSchema),Controller.updateWareHouse)
router.delete("/warehouse/:id",Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Middleware.isCorrectRole([SuperAdminModel,ManagerModel]),Controller.deleteWareHouse)

module.exports = router