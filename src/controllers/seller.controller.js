const SellerModel = require("../models/seller.model");
const jwt = require("jsonwebtoken");
const { getCache, setCache, deleteCache } = require("../helpers/redis.helper");
const { default: mongoose } = require("mongoose");
const SellerPayedModel = require("../models/sellerPayed.model");
const { encrypt, decrypt } = require("../helpers/crypto.helper");
const DeliveryModel = require("../models/delivery.model");
const SuperAdminModel = require("../models/superAdmin.model");
const ManagerModel = require("../models/manager.model");

exports.createSeller = async (req, res) => {
  try {
    const { username, phone, ovenId, password } = req.body;
    let hashPassword = encrypt(password ? password : phone.slice(-4));
    const superAdminId = req.use.id;

    const models = [SuperAdminModel, SellerModel, ManagerModel, DeliveryModel];

    for (const model of models) {
      const item = await model.findOne({ username: username?.trim() });
      if (item) {
        return res.status(400).json({
          succes: false,
          message: "Bunday nomli foydalanuvchi mavjud",
        });
      }
    }

    const newSeller = new SellerModel({
      username: username?.trim(),
      password: hashPassword,
      phone,
      // price,
      superAdminId,
      ovenId,
    });
    const refreshToken = await jwt.sign(
      { id: newSeller._id, username: newSeller.username?.trim() },
      process.env.JWT_TOKEN_REFRESH
    );
    newSeller.refreshToken = refreshToken;
    await newSeller.save();
    await deleteCache(`seller`);
    await deleteCache(`sellerPayed`);
    // await createSelleryPayed({ body: { sellerId: newSeller._id, price: newSeller.price, status: "To`landi", type: "Kunlik" } })
    return res.status(201).json({
      success: true,
      message: "seller created",
      seller: {
        username: newSeller.username,
        password: newSeller.password,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSellers = async (req, res) => {
  try {
    const cashedSeller = await getCache("seller" + req.use.id);
    if (cashedSeller) {
      return res.status(200).json({
        success: true,
        message: "list of sellers",
        sellers: cashedSeller?.reverse(),
      });
    }
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    let sellers = null;
    if (req.use.role === "superAdmin") {
      sellers = await SellerModel.aggregate([{ $match: { status: true } }])
    } else {
      sellers = await SellerModel.aggregate([
        { $match: { superAdminId: new mongoose.Types.ObjectId(req.use.id), createdAt: { $gte: oneMonthAgo, $lt: today }, status: true } },
      ]);
    }
    const data = [];
    if (sellers.length > 0) {
      for (const key of sellers) {
        const sellerPayedes = await SellerPayedModel.aggregate([
          { $match: { sellerId: key._id, active: true } }
        ])
        let totalPrice = sellerPayedes.reduce((a, b) => {
          switch (b.type) {
            case "Bonus":
              return a + b?.price;
              break;
            case "Ishhaqi":
              return a + b?.price;
              break;
            case "Shtraf":
              return a - b?.price;
              break;
            case "Kunlik":
              return a + b?.price;
              break;
            case "Avans":
              return a - b?.price;
              break;
            case "Oylik":
              return a - b?.price;
              break;
            case "O`chirildi":
              return a - b?.price;
              break;
            default:
              break;
          }
        }, 0);
        if (req.use.role === "superAdmin") {
          data.push({
            ...key,
            totalPrice,
            history: sellerPayedes.reverse(),
          });
        } else {
          data.push({ ...key, totalPrice, history: sellerPayedes.reverse() });
        }
      }
    }

    await setCache("sellers" + req.use.id, data);

    return res.status(200).json({
      success: true,
      message: "list of sellers",
      sellers: data.reverse(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSellerById = async (req, res) => {
  try {
    const seller = await SellerModel.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "saller not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "details of seller",
      seller,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateSeller = async (req, res) => {
  try {
    const { username, password, phone, price } = req.body;
    let hashPassword;
    if (password) {
      hashPassword = encrypt(password);
    }
    const seller = await SellerModel.findByIdAndUpdate(
      req.params.id,
      password
        ? {
          username,
          password: hashPassword,
          phone,
          price,
          updateAt: new Date(),
        }
        : { username, phone, price, updateAt: new Date() },
      { new: true }
    );
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "saller not found",
      });
    }
    await deleteCache(`seller`);
    return res.status(200).json({
      success: true,
      message: "seller updated",
      seller,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteSeller = async (req, res) => {
  try {
    const seller = await SellerModel.findByIdAndDelete(req.params.id);
    const sellerPayeds = await SellerPayedModel.aggregate([{ $match: { selelrId: seller._id } }])
    sellerPayeds.forEach(async ({ _id }) => {
      await SellerPayedModel.findByIdAndUpdate(_id, { active: false }, { new: true })
    })
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "saller not found",
      });
    }
    await deleteCache(`seller`);
    await deleteCache(`sellerPayed`);
    return res.status(200).json({
      success: true,
      message: "seller deleted",
      seller,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteSellerHistory = async (req, res) => {
  try {
    const seller = await SellerModel.findById(req.params.id)
    const sellerPayeds = await SellerPayedModel.aggregate([{ $match: { sellerId: seller._id } }])
    sellerPayeds.forEach(async (item) => {
      await SellerPayedModel.findByIdAndUpdate(item._id, { active: false }, { new: true })
    })
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "seller not found"
      })
    }
    return res.status(200).json("Seller history deleted")
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}