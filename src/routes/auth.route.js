const { Router } = require('express')
const router = Router()

const Controller = require('../controllers/auth.controller')
const Middleware = require('../middlewares')

const { LoginAuthSchema } = require('../validations/auth.validation')

router.post('/login',Middleware.verifyValidation(LoginAuthSchema),Controller.AuthLogin)
router.get('/token',Middleware.verifyToken(process.env.JWT_TOKEN_ACCESS),Controller.getUserByToken) 
// api/login
module.exports = router