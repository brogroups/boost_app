const jwt = require("jsonwebtoken")

exports.verifyValidation = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        })
    }
    next()
}


exports.verifyToken = (jwt_secret) => (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).json({ message: "No token provided!" });
    }
    jwt.verify(token, jwt_secret, async (error, use) => {
        if (error) {
            return res.status(500).json({ success: false, message: error })
        }
        req.use = use      
        next()
    })
};

exports.isCorrectRole = (models) => async (req, res, next) => {
    try {
        for (const model of models) {
            const item = await model.findById(req.use.id)    
            if (item) {
              return next()
            } 
        }
        return res.status(403).json({ success: false, message: "Access denied! " });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}