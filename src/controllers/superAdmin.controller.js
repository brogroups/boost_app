const { decrypt, encrypt } = require("../helpers/crypto.helper");
const SuperAdminModel = require("../models/superAdmin.model");
const jwt = require("jsonwebtoken");

exports.loginSuperAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const superAdmin = await SuperAdminModel.findOne({ username });
    if (!superAdmin) {
      return res.status(400).json({
        success: false,
        message: "Login yoki parol hato",
      });
    }
    const decryptPassword = decrypt(superAdmin.password);
    if (decryptPassword !== password) {
      return res.status(400).json({
        success: false,
        message: "Login yoki parol hato",
      });
    }
    const accessToken = await jwt.sign(
      { id: superAdmin.id, username: superAdmin.username },
      process.env.JWT_TOKEN_ACCESS,
      { expiresIn: "7d" }
    );
    return res.status(200).json({
      success: true,
      message: "login is successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSuperAdminByToken = async (req, res) => {
  try {
    const superAdminId = req.useId;
    const superAdmin = await SuperAdminModel.findById(superAdminId);
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "super admin not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "details of super admin",
      superAdmin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateSuperAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const superAdminId = req.useId;
    const hashPassword = encrypt(password);
    const superAdmin = await SuperAdminModel.findByIdAndUpdate(
      superAdminId,
      { username, password: hashPassword, updateAt: new Date() },
      { new: true }
    );
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "superAdmin not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "super admin updated",
      superAdmin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
