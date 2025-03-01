const express = require("express");
const cors = require("cors");
const SuperAdminModel = require("./models/superAdmin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ConnecToDb = require("./configs/connection");

require("dotenv").config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin:"http://localhost:8080",
    // origin: ["http://localhost:8080","http://localhost:5173","https://safo-non.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const ManagerRoute = require("./routes/manager.route");
app.use("/api", ManagerRoute);

const SuperAdminRoute = require("./routes/superAdmin.route");
app.use("/api", SuperAdminRoute);

const SellerRoute = require("./routes/seller.route");
app.use("/api", SellerRoute);

const DeliveryRoute = require("./routes/delivery.route");
app.use("/api", DeliveryRoute);

const MagazineRoute = require("./routes/magazine.route");
app.use("/api", MagazineRoute);

const typeOfBreadRoute = require("./routes/typeOfBread.route");
app.use("/api", typeOfBreadRoute);

const SellerBreadRoute = require("./routes/sellerBread.route");
app.use("/api", SellerBreadRoute);

const orderWithDeliveryRoute = require("./routes/orderWithDeliver.route");
app.use("/api", orderWithDeliveryRoute);

const debt1Route = require("./routes/debt1.route");
app.use("/api", debt1Route);

const typeOfDebtRoute = require("./routes/typeofDebt.route");
app.use("/api", typeOfDebtRoute);

const debt2Route = require("./routes/debt2.route");
app.use("/api", debt2Route);

const DeliveryDebtRoute = require("./routes/deliveryDebt.route");
app.use("/api", DeliveryDebtRoute);

const CreateMagazineRoute = require("./routes/createMagazine.route");
app.use("/api", CreateMagazineRoute);

const AuthRoute = require("./routes/auth.route");
app.use("/api", AuthRoute);

const sellingBreadRoute = require("./routes/sellingBread.route");
app.use("/api", sellingBreadRoute);

const historyRoute = require("./routes/history.route");
app.use("/api", historyRoute);

const StaticRoute = require("./routes/static.route");
app.use("/api", StaticRoute);

const SellerPayedRoute = require("./routes/sellerPayed.route");
app.use("/api", SellerPayedRoute);

const deliveryPayedRoute = require("./routes/deliveryPayed.route");
app.use("/api", deliveryPayedRoute);

const typeOfWareHouseRoute = require("./routes/typeOfWareHouse.route")
app.use("/api", typeOfWareHouseRoute)

const WareHouseRoute = require("./routes/warehouse.route")
app.use("/api", WareHouseRoute)

const payedStatusRoute = require("./routes/payedStatus.route")
app.use("/api", payedStatusRoute)

const TypeOfPayed = require("./routes/typeOfPayed.route")
app.use("/api",TypeOfPayed)

app.use("/api/refreshToken", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(403).json({ message: "Token kerak" });

  try {
    jwt.verify(refreshToken, process.env.JWT_TOKEN_REFRESH, (err, user) => {
      console.log(err);
      console.log(user);

      if (err) return res.status(403).json({ success: false, message: err.message });

      const newAccessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_TOKEN_ACCESS,
        { expiresIn: "7d" }
      );
      res.status(200).json({ succes: true, accessToken: newAccessToken });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 3500;

const StartServer = async () => {
  try {
    app.listen(PORT, () =>
      console.log(`app is listening http://localhost:${PORT}`)
    );
    await ConnecToDb();
    const superAdmin = await SuperAdminModel.findOne({ login: "admin" });
    if (!superAdmin) {
      const hashPassword = await bcrypt.hash("admin", 10);
      const refreshToken = await jwt.sign(
        { username: "admin", hashPassword, login: "admin" },
        process.env.JWT_TOKEN_REFRESH
      );
      await SuperAdminModel.create({
        username: "admin",
        password: hashPassword,
        login: "admin",
        refreshToken,
      });
      console.log("super admin created");
    } else {
      console.log("there is super admin");
    }
  } catch (error) {
    console.error("error:", error.message);
  }
};

StartServer();