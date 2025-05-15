const { default: mongoose } = require("mongoose");
const Debt1Model = require("../models/debt1.model");
const Debt2Model = require("../models/debt2.model");
const DeliveryDebtModel = require("../models/deliveryDebt.model");
const SellingBreadModel = require("../models/sellingBread.model");
const SellerModel = require("../models/seller.model");
const ManagerModel = require("../models/manager.model");
const SellerPayedModel = require("../models/sellerPayed.model");
const { getSellerBread } = require("./sellerBread.controller");
const SaleModel = require("../models/sale.mode");
const DeliveryPayedModel = require("../models/deliveryPayed.model");
const ManagerWareModel = require("../models/managerWare.model");
const OrderWithDeliveryModel = require("../models/orderWithDelivery.model");
const MagazinePayedModel = require("../models/magazinePayed.model");

exports.getStatics = async (req, res) => {
  try {
    switch (req.use.role) {
      case "superAdmin":
        return superAdminStatics(req, res);
        break;
      case "manager":
        return managerStatics(req, res);
        break;
      // Delivery =====================================================================
      case "delivery":
        return deliveryStatics(req, res);
        break;
      case "seller":
        return sellerStatics(req, res);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
  }
};

const superAdminStatics = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDay = new Date(today);
  const endDay = new Date(today);
  endDay.setHours(23, 59, 59, 999);

  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const diffToSunday = 7 - dayOfWeek;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + diffToSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  try {
    let debt1s = await Debt1Model.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    }).lean();
    let debt2s = await Debt2Model.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    })
      .populate("omborxonaProId", "name price")
      .lean();
    let deliveryDebt = await DeliveryDebtModel.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    })
      .populate("deliveryId", "username")
      .lean();

    let deliverypayeds1 = await DeliveryPayedModel.aggregate([
      { $match: { type: { $in: ["Avans", "Oylik"] }, active: true } },
    ]);

    let sellerpayeds = await SellerPayedModel.aggregate([
      { $match: { type: { $in: ["Avans", "Oylik"] }, active: true } },
    ]);

    debt1s = debt1s.map((item) => {
      return { ...item, role: "seller" };
    });

    debt2s = debt2s.map((item) => {
      return { ...item, role: "seller" };
    });

    deliveryDebt = deliveryDebt.map((item) => {
      return { ...item, role: "delivery" };
    });

    let deliveryPrixod = await SellingBreadModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          status: true,
        },
      },
      {
        $lookup: {
          from: "managerwares",
          localField: "breadId",
          foreignField: "_id",
          as: "breadDetails",
        },
      },
      {
        $unwind: "$breadDetails",
      },
      {
        $lookup: {
          from: "typeofbreads",
          localField: "breadDetails.bread",
          foreignField: "_id",
          as: "breadIdDetails",
        },
      },
      {
        $unwind: "$breadIdDetails",
      },
      {
        $lookup: {
          from: "deliveries",
          localField: "deliveryId",
          foreignField: "_id",
          as: "delivery",
        },
      },
      {
        $unwind: "$delivery",
      },
      {
        $lookup: {
          from: "magazines",
          localField: "magazineId",
          foreignField: "_id",
          as: "magazine",
        },
      },
      {
        $unwind: "$magazine",
      },
      {
        $project: {
          _id: 1,
          breadId: {
            _id: "$breadIdDetails._id",
            title: "$breadIdDetails.title",
            price: "$breadIdDetails.price",
            price2: "$breadIdDetails.price2",
            price3: "$breadIdDetails.price3",
            price4: "$breadIdDetails.price4",
            createdAt: "$breadIdDetails.createdAt",
          },
          paymentMethod: 1,
          deliveryId: {
            _id: "$delivery._id",
            username: "$delivery.username",
          },
          magazineId: {
            _id: "$magazine._id",
            title: "$magazine.title",
          },
          money: 1,
          pricetype: 1,
          createdAt: 1,
          quantity: 1,
        },
      },
    ]);

    deliveryPrixod = [
      ...deliveryPrixod,
      ...(await SellingBreadModel.aggregate([
        { $match: { status: true } },
        {
          $lookup: {
            from: "orderwithdeliveries",
            localField: "breadId",
            foreignField: "_id",
            as: "breadIdd",
          },
        },
        { $unwind: "$breadIdd" },
        { $unwind: "$breadIdd.typeOfBreadIds" },
        {
          $lookup: {
            from: "managerwares",
            localField: "breadIdd.typeOfBreadIds.bread",
            foreignField: "_id",
            as: "breadDetails",
          },
        },
        { $unwind: "$breadDetails" },
        {
          $lookup: {
            from: "typeofbreads",
            localField: "breadDetails.bread",
            foreignField: "_id",
            as: "breadIdDetails",
          },
        },
        { $unwind: "$breadIdDetails" },
        {
          $lookup: {
            from: "deliveries",
            localField: "deliveryId",
            foreignField: "_id",
            as: "delivery",
          },
        },
        { $unwind: "$delivery" },
        {
          $lookup: {
            from: "magazines",
            localField: "magazineId",
            foreignField: "_id",
            as: "magazine",
          },
        },
        {
          $unwind: "$magazine",
        },
        {
          $group: {
            _id: "$_id",
            bread: { $first: "$bread" },
            paymentMethod: { $first: "$paymentMethod" },
            deliveryId: {
              $first: {
                _id: "$delivery._id",
                username: "$delivery.username",
              },
            },
            magazineId: {
              $first: { _id: "$magazine._id", title: "$magazine.title" },
            },
            quantity: { $first: "$quantity" },
            money: { $first: "$money" },
            pricetype: { $first: "$pricetype" },
            createdAt: { $first: "$createdAt" },
            typeOfBreadIds: {
              $push: {
                breadId: {
                  _id: "$breadIdDetails._id",
                  title: "$breadIdDetails.title",
                  price: "$breadIdDetails.price",
                  price2: "$breadIdDetails.price2",
                  price3: "$breadIdDetails.price3",
                  price4: "$breadIdDetails.price4",
                  createdAt: "$breadIdDetails.createdAt",
                },
                quantity: "$breadIdd.typeOfBreadIds.quantity",
              },
            },
          },
        },
      ])),
    ].map((item) => {
      const breadId = item.typeOfBreadIds.find(
        (i) => String(i.breadId._id) === String(item.bread)
      )?.breadId;
      let totalPrice =
        (item.pricetype === "tan"
          ? breadId?.price
          : item.pricetype === "dokon"
          ? breadId?.price2
          : item.pricetype === "toyxona"
          ? breadId?.price3
          : breadId.price) * item.quantity;
      let pending = totalPrice - item.money;
      return {
        ...item,
        totalPrice,
        pending,
        price:
          item.pricetype === "tan"
            ? breadId?.price
            : item.pricetype === "dokon"
            ? breadId?.price2
            : item.pricetype === "toyxona"
            ? breadId?.price3
            : breadId.price,
        breadId: breadId || item.typeOfBreadIds[0],
      };
    });

    deliveryPrixod = deliveryPrixod.reduce((a, b) => {
      const excite = a.find((i) => String(i._id) == String(b._id));
      if (!excite) {
        a.push({ ...b });
      }
      return a;
    }, []);

    let Allsales = await SaleModel.aggregate([{ $match: { status: true } }]);

    const pending = [];
    for (const key of deliveryPrixod) {
      if (key.pending > 0) {
        pending.push({ ...key });
      }
    }

    const managers = await ManagerModel.aggregate([
      { $match: { status: true } },
    ]);
    const mamangersStatics = [];

    for (const item of managers) {
      const sellers = await SellerModel.aggregate([
        {
          $match: {
            superAdminId: new mongoose.Types.ObjectId(item._id),
            status: true,
          },
        },
      ]);

      let debt = [];
      let managerPrixod = [];
      let managerPending = [];
      let sellerPayeds = [];
      for (const seller of sellers) {
        managerPrixod = [
          ...managerPrixod,
          ...(await SellingBreadModel.aggregate([
            {
              $lookup: {
                from: "managerwares",
                localField: "breadId",
                foreignField: "_id",
                as: "breadDetails",
              },
            },
            {
              $unwind: "$breadDetails",
            },
            { $match: { "breadDetails.sellerId": seller._id } },
            {
              $lookup: {
                from: "typeofbreads",
                localField: "breadDetails.bread",
                foreignField: "_id",
                as: "breadIdDetails",
              },
            },
            {
              $unwind: "$breadIdDetails",
            },
            {
              $lookup: {
                from: "deliveries",
                localField: "deliveryId",
                foreignField: "_id",
                as: "delivery",
              },
            },
            {
              $unwind: "$delivery",
            },
            {
              $lookup: {
                from: "magazines",
                localField: "magazineId",
                foreignField: "_id",
                as: "magazine",
              },
            },
            {
              $unwind: "$magazine",
            },
            {
              $project: {
                _id: 1,
                breadDetails: "$breadDetails",
                breadId: {
                  _id: "$breadIdDetails._id",
                  title: "$breadIdDetails.title",
                  price: "$breadIdDetails.price",
                  price2: "$breadIdDetails.price2",
                  price3: "$breadIdDetails.price3",
                  price4: "$breadIdDetails.price4",
                  createdAt: "$breadIdDetails.createdAt",
                },
                paymentMethod: 1,
                deliveryId: {
                  _id: "$delivery._id",
                  username: "$delivery.username",
                },
                magazineId: {
                  _id: "$magazine._id",
                  title: "$magazine.title",
                },
                money: 1,
                pricetype: 1,
                createdAt: 1,
                quantity: 1,
              },
            },
          ])),
        ];

        managerPrixod = [
          ...managerPrixod,
          ...(await SellingBreadModel.aggregate([
            {
              $lookup: {
                from: "orderwithdeliveries",
                localField: "breadId",
                foreignField: "_id",
                as: "breadD",
              },
            },
            { $unwind: "$breadD" },
            { $unwind: "$breadD.typeOfBreadIds" },
            {
              $lookup: {
                from: "managerwares",
                localField: "breadD.typeOfBreadIds.bread",
                foreignField: "_id",
                as: "breadDetails",
              },
            },
            { $unwind: "$breadDetails" },
            {
              $match: {
                status: true,
                createdAt: { $gte: startOfWeek, $lte: endOfWeek },
              },
            },
            {
              $lookup: {
                from: "typeofbreads",
                localField: "breadDetails.bread",
                foreignField: "_id",
                as: "breadIdDetails",
              },
            },
            { $unwind: "$breadIdDetails" },
            {
              $lookup: {
                from: "deliveries",
                localField: "deliveryId",
                foreignField: "_id",
                as: "delivery",
              },
            },
            { $unwind: "$delivery" },
            {
              $lookup: {
                from: "magazines",
                localField: "magazineId",
                foreignField: "_id",
                as: "magazine",
              },
            },
            { $unwind: "$magazine" },
            {
              $group: {
                _id: "$_id",
                paymentMethod: { $first: "$paymentMethod" },
                deliveryId: {
                  $first: {
                    _id: "$delivery._id",
                    username: "$delivery.username",
                  },
                },
                magazineId: {
                  $first: {
                    _id: "$magazine._id",
                    title: "$magazine.title",
                  },
                },
                quantity: { $first: "$quantity" },
                money: { $first: "$money" },
                pricetype: { $first: "$pricetype" },
                createdAt: { $first: "$createdAt" },
                bread: { $first: "$bread" },
                typeOfBreadIds: {
                  $push: {
                    breadId: {
                      _id: "$breadIdDetails._id",
                      title: "$breadIdDetails.title",
                      price: "$breadIdDetails.price",
                      price2: "$breadIdDetails.price2",
                      price3: "$breadIdDetails.price3",
                      price4: "$breadIdDetails.price4",
                      createdAt: "$breadIdDetails.createdAt",
                    },
                    quantity: "$breadD.typeOfBreadIds.quantity",
                    breadDetails: "$breadDetails",
                  },
                },
              },
            },
          ])),
        ]
          .filter((i) =>
            i.typeOfBreadIds.find(
              (it) => String(it.breadDetails.bread) === String(i.bread)
            )
          )
          .map((item) => {
            const breadId =
              item.typeOfBreadIds.find(
                (i) => String(i.breadId._id) === String(item.bread)
              )?.breadId || {};
            let totalPrice =
              (item.pricetype === "tan"
                ? breadId?.price
                : item.pricetype === "dokon"
                ? breadId?.price2
                : item.pricetype === "toyxona"
                ? breadId?.price3
                : breadId.price) * item.quantity;
            let pending = totalPrice - item.money;
            return {
              ...item,
              totalPrice,
              pending,
              price:
                item.pricetype === "tan"
                  ? breadId?.price
                  : item.pricetype === "dokon"
                  ? breadId?.price2
                  : item.pricetype === "toyxona"
                  ? breadId?.price3
                  : breadId.price,
              breadId: breadId || item.typeOfBreadIds[0],
            };
          });

        sellerPayeds = await SellerPayedModel.aggregate([
          {
            $match: {
              type: { $in: ["Avans", "Oylik"] },
              sellerId: seller._id,
            },
          },
        ]);
      }
      debt.push(
        await Debt1Model.aggregate([
          {
            $match: {
              managerId: item._id,
              createdAt: { $gte: startOfWeek, $lte: endOfWeek },
            },
          },

          {
            $project: {
              title: 1,
              quantity: 1,
              reason: 1,
              price: 1,
              createdAt: 1,
            },
          },
        ])
      );
      debt.push(
        await Debt2Model.aggregate([
          {
            $match: {
              managerId: item._id,
              createdAt: { $gte: startOfWeek, $lte: endOfWeek },
            },
          },
          {
            $lookup: {
              from: "typeofwarehouses",
              localField: "omborxonaProId",
              foreignField: "_id",
              as: "omborxona",
            },
          },
          {
            $unwind: "$omborxona",
          },

          {
            $project: {
              _id: 1,
              quantity: 1,
              description: 1,
              omborxonaProId: {
                _id: "$omborxona._id",
                name: "$omborxona.name",
                price: "$omborxona.price",
              },

              createdAt: 1,
            },
          },
        ])
      );
      managerPrixod = managerPrixod.reduce((a, b) => {
        const excite = a.find((i) => String(i._id) == String(b._id));
        if (!excite) {
          a.push({ ...b });
        }
        return a;
      }, []);
      for (const key of managerPrixod) {
        let allPrice =
          (key.pricetype === "tan"
            ? key.breadId.price
            : key.pricetype === "dokon"
            ? key.breadId.price2
            : key.pricetype === "toyxona"
            ? key.breadId.price3
            : 0) * key.quantity;
        if (allPrice - key.money >= 0) {
          managerPending.push({ ...key, pending: allPrice - key.money });
        }
      }
      debt = debt.filter((item) => item.length !== 0).flat(Infinity);

      const sale = await SaleModel.aggregate([
        {
          $match: {
            managerId: new mongoose.Types.ObjectId(item._id),
            status: true,
          },
        },
      ]);

      mamangersStatics.push({
        _id: item._id,
        username: item.username,
        createdAt: item.createdAt,
        debt: {
          totalPrice:
            [...debt, ...sellerPayeds].length > 0
              ? [...debt, ...sellerPayeds].reduce(
                  (a, b) =>
                    a +
                    (b?.price
                      ? b?.price
                      : b?.omborxonaProId?.price
                      ? b.omborxonaProId?.price
                      : 0) *
                      (b.quantity || 1),
                  0
                )
              : 0,
          history: [...debt, ...sellerPayeds],
        },
        pending: {
          totalPrice: managerPending.reduce((a, b) => a + b.pending, 0),
          history: managerPending,
        },
        prixod: {
          totalPrice: [...managerPrixod, ...sale].reduce(
            (a, b) => a + b.money,
            0
          ),
          history: [...managerPrixod, ...sale],
        },
      });
    }
    return res.status(200).json({
      statics: {
        debt: {
          totalPrice: [
            ...debt1s,
            ...debt2s,
            ...deliveryDebt,
            ...deliverypayeds1,
            ...sellerpayeds,
          ].reduce(
            (a, b) =>
              a +
              (b.price
                ? b.price
                : b?.omborxonaProId?.price
                ? b?.omborxonaProId?.price
                : 0) *
                (b?.quantity || 1),
            0
          ),
          history: [
            ...debt1s,
            ...debt2s,
            ...deliveryDebt,
            ...deliverypayeds1,
            ...sellerpayeds,
          ],
        },
        prixod: {
          totalPrice:
            deliveryPrixod.reduce(
              (a, b) =>
                a +
                (b.pricetype === "tan"
                  ? b?.breadId?.price
                  : b.pricetype === "dokon"
                  ? b?.breadId?.price2
                  : b.pricetype === "toyxona"
                  ? b?.breadId?.price3
                  : 0) *
                  b.quantity,
              0
            ) + Allsales.reduce((a, b) => a + b.money, 0),
          history: [...deliveryPrixod, ...Allsales],
        },
        pending: {
          totalPrice: pending.reduce((a, b) => a + b.pending, 0),
          history: pending,
        },
      },
      managerStatics: mamangersStatics.reverse(),
    });
  } catch (error) {
    console.error(error);
  }
};
const managerStatics = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDay = new Date(today);
  const endDay = new Date(today);
  endDay.setHours(23, 59, 59, 999);

  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const diffToSunday = 7 - dayOfWeek;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + diffToSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  try {
    let debt = [];
    let managerPending = [];
    let sales = [];
    let sellerPayedsManager = [];
    let warehouse = [];
    const sellers = await SellerModel.aggregate([
      {
        $match: {
          superAdminId: new mongoose.Types.ObjectId(req.use.id),
          status: true,
        },
      },
    ]);
    debt.push(
      await Debt1Model.aggregate([
        {
          $match: {
            managerId: new mongoose.Types.ObjectId(req.use.id),
            createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },

        {
          $project: {
            title: 1,
            quantity: 1,
            reason: 1,
            price: 1,
            createdAt: 1,
          },
        },
      ])
    );
    debt.push(
      await Debt2Model.aggregate([
        {
          $match: {
            managerId: new mongoose.Types.ObjectId(req.use.id),
            createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },
        {
          $lookup: {
            from: "typeofwarehouses",
            localField: "omborxonaProId",
            foreignField: "_id",
            as: "omborxona",
          },
        },
        {
          $unwind: "$omborxona",
        },

        {
          $project: {
            _id: 1,
            quantity: 1,
            description: 1,
            omborxonaProId: {
              _id: "$omborxona._id",
              name: "$omborxona.name",
              price: "$omborxona.price",
            },

            createdAt: 1,
          },
        },
      ])
    );
    for (const seller of sellers) {
      warehouse = [
        ...warehouse,
        ...(await ManagerWareModel.aggregate([
          {
            $match: {
              sellerId: seller._id,
              status: true,
              createdAt: { $gte: startOfWeek, $lte: endOfWeek },
            },
          },
          {
            $lookup: {
              from: "sellers",
              localField: "sellerId",
              foreignField: "_id",
              as: "manager",
            },
          },
          {
            $unwind: "$manager",
          },
          {
            $lookup: {
              from: "typeofbreads",
              localField: "bread",
              foreignField: "_id",
              as: "Bread",
            },
          },
          {
            $unwind: "$Bread",
          },
          {
            $project: {
              _id: 1,
              seller: {
                username: "$manager.username",
              },
              bread: "$Bread",
              totalQuantity: 1,
              totalQuantity2: 1,
              totalQopQuantity: 1,
              createdAt: 1,
            },
          },
        ])),
      ];

      sellerPayedsManager = await SellerPayedModel.aggregate([
        {
          $match: {
            type: { $in: ["Avans", "Oylik"] },
            active: true,
            sellerId: seller._id,
            createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },
      ]);
    }

    debt = debt.filter((item) => item.length !== 0).flat(Infinity);
    sales = await SaleModel.aggregate([
      {
        $match: {
          managerId: new mongoose.Types.ObjectId(req.use.id),
          status: true,
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $lookup: {
          from: "managerwares",
          localField: "breadId",
          foreignField: "_id",
          as: "bread",
        },
      },
      {
        $unwind: "$bread",
      },
      {
        $lookup: {
          from: "typeofbreads",
          localField: "bread.bread",
          foreignField: "_id",
          as: "breadId2",
        },
      },
      {
        $unwind: "$breadId2",
      },
      {
        $project: {
          _id: 1,
          breadId: {
            _id: "$breadId2._id",
            title: "$breadId2.title",
            price: "$breadId2.price",
            price2: "$breadId2.price2",
            price3: "$breadId2.price3",
            price4: "$breadId2.price4",
            createdAt: "$breadId2.createdAt",
          },
          money: 1,
          quantity: 1,
          description: 1,
          managerId: 1,
          createdAt: 1,
          pricetype: 1,
        },
      },
    ]);

    for (const key of sales) {
      let price =
        key.pricetype === "tan"
          ? key?.breadId?.price
          : key.pricetype === "dokon"
          ? key?.breadId?.price2
          : key.pricetype === "toyxona"
          ? key?.breadId?.price3
          : key?.breadId?.price;

      let totalPrice = price * key.quantity;
      let pending = totalPrice - key.money;
      if (pending >= 0) {
        managerPending.push({ ...key, pending, totalPrice });
      }
    }

    return res.status(200).json({
      statics: {
        debt: {
          totalPrice:
            [...debt, ...sellerPayedsManager].length > 0
              ? [...debt, ...sellerPayedsManager].reduce(
                  (a, b) =>
                    a +
                    (b.price
                      ? b.price
                      : b.omborxonaProId.price
                      ? b.omborxonaProId.price
                      : 0) *
                      (b.quantity || 1),
                  0
                )
              : 0,
          history: [...debt, ...sellerPayedsManager],
        },
        pending: {
          totalPrice: managerPending.reduce((a, b) => a + b.pending, 0),
          history: managerPending,
        },
        prixod: {
          totalPrice: sales.reduce(
            (a, b) =>
              a +
              (b.pricetype === "tan"
                ? b.breadId.price
                : b.pricetype === "dokon"
                ? b.breadId.price2
                : b.pricetype === "toyxona"
                ? b.breadId.price3
                : b.breadId.price) *
                b.quantity,
            0
          ),
          history: sales.map((item) => {
            let price =
              item.pricetype === "tan"
                ? item.breadId.price
                : item.pricetype === "dokon"
                ? item.breadId.price2
                : item.pricetype === "toyxona"
                ? item.breadId.price3
                : 0;
            return { ...item, price };
          }),
        },
        sellingBread: {
          totalQuantity: sales.reduce((a, b) => a + (b.quantity || 0), 0),
          history: sales,
        },
        managerware: {
          totalQuantity: warehouse.reduce((a, b) => a + b.totalQuantity2, 0),
          history: warehouse,
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const deliveryStatics = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDay = new Date(today);
  const endDay = new Date(today);
  endDay.setHours(23, 59, 59, 999);
  try {
    let DeliveryDebts = await DeliveryDebtModel.aggregate([
      {
        $match: {
          deliveryId: new mongoose.Types.ObjectId(req.use.id),
          createdAt: { $gte: startDay, $lte: endDay },
        },
      },
      {
        $lookup: {
          from: "deliveries",
          localField: "deliveryId",
          foreignField: "_id",
          as: "delivery",
        },
      },
      {
        $unwind: "$delivery",
      },
      {
        $project: {
          _id: 1,
          title: 1,
          price: 1,
          deliveryId: {
            _id: "$delivery.id",
            username: "$delivery.username",
          },
          description: 1,
          createdAt: 1,
        },
      },
    ]);
    let pendingDelivery = [];
    let soldBread = await SellingBreadModel.aggregate([
      {
        $match: {
          deliveryId: new mongoose.Types.ObjectId(req.use.id),
          status: true,
          createdAt: { $gte: startDay, $lte: endDay },
        },
      },
      {
        $lookup: {
          from: "orderwithdeliveries",
          localField: "breadId",
          foreignField: "_id",
          as: "breadIdd",
        },
      },
      { $unwind: "$breadIdd" },
      { $unwind: "$breadIdd.typeOfBreadIds" },
      {
        $lookup: {
          from: "managerwares",
          localField: "breadIdd.typeOfBreadIds.bread",
          foreignField: "_id",
          as: "breadDetails",
        },
      },
      { $unwind: "$breadDetails" },
      {
        $lookup: {
          from: "typeofbreads",
          localField: "breadDetails.bread",
          foreignField: "_id",
          as: "breadIdDetails",
        },
      },
      { $unwind: "$breadIdDetails" },
      {
        $lookup: {
          from: "deliveries",
          localField: "deliveryId",
          foreignField: "_id",
          as: "delivery",
        },
      },
      { $unwind: "$delivery" },
      {
        $lookup: {
          from: "magazines",
          localField: "magazineId",
          foreignField: "_id",
          as: "magazine",
        },
      },
      {
        $unwind: "$magazine",
      },
      {
        $group: {
          _id: "$_id",
          bread: { $first: "$bread" },
          paymentMethod: { $first: "$paymentMethod" },
          deliveryId: {
            $first: {
              _id: "$delivery._id",
              username: "$delivery.username",
            },
          },
          magazineId: {
            $first: { _id: "$magazine._id", title: "$magazine.title" },
          },
          quantity: { $first: "$quantity" },
          money: { $first: "$money" },
          pricetype: { $first: "$pricetype" },
          createdAt: { $first: "$createdAt" },
          typeOfBreadIds: {
            $push: {
              breadId: {
                _id: "$breadIdDetails._id",
                title: "$breadIdDetails.title",
                price: "$breadIdDetails.price",
                price2: "$breadIdDetails.price2",
                price3: "$breadIdDetails.price3",
                price4: "$breadIdDetails.price4",
                createdAt: "$breadIdDetails.createdAt",
              },
              quantity: "$breadIdd.typeOfBreadIds.quantity",
            },
          },
        },
      },
    ]);

    let soldBread1 = await SellingBreadModel.aggregate([
      {
        $match: {
          deliveryId: new mongoose.Types.ObjectId(req.use.id),
          status: true,
          createdAt: { $gte: startDay, $lte: endDay }
        },
      },
      {
        $lookup: {
          from: "managerwares",
          localField: "breadId",
          foreignField: "_id",
          as: "breadDetails",
        },
      },
      {
        $unwind: "$breadDetails",
      },
      {
        $lookup: {
          from: "typeofbreads",
          localField: "breadDetails.bread",
          foreignField: "_id",
          as: "breadIdDetails",
        },
      },
      {
        $unwind: "$breadIdDetails",
      },
      {
        $lookup: {
          from: "deliveries",
          localField: "deliveryId",
          foreignField: "_id",
          as: "delivery",
        },
      },
      {
        $unwind: "$delivery",
      },
      {
        $lookup: {
          from: "magazines",
          localField: "magazineId",
          foreignField: "_id",
          as: "magazine",
        },
      },
      {
        $unwind: "$magazine",
      },
      {
        $project: {
          _id: 1,
          breadId: {
            _id: "$breadIdDetails._id",
            title: "$breadIdDetails.title",
            price: "$breadIdDetails.price",
            price2: "$breadIdDetails.price2",
            price3: "$breadIdDetails.price3",
            price4: "$breadIdDetails.price4",
            createdAt: "$breadIdDetails.createdAt",
          },
          paymentMethod: 1,
          deliveryId: {
            _id: "$delivery._id",
            username: "$delivery.username",
          },
          magazineId: 1,
          money: 1,
          pricetype: 1,
          createdAt: 1,
          quantity: 1,
          magazineId: {
            _id: "$magazine._id",
            title: "$magazine.title",
          },
        },
      },
    ]);

    let allSoldBread = [
      ...soldBread.map((item) => {
        const breadId = item.typeOfBreadIds.find(
          (i) => String(i.breadId._id) === String(item.bread)
        )?.breadId;
        let totalPrice =
          (item.pricetype === "tan"
            ? breadId?.price
            : item.pricetype === "dokon"
            ? breadId?.price2
            : item.pricetype === "toyxona"
            ? breadId?.price3
            : breadId.price) * item.quantity;
        let pending = totalPrice - item.money;
        return {
          ...item,
          totalPrice,
          pending,
          price:
            item.pricetype === "tan"
              ? breadId?.price
              : item.pricetype === "dokon"
              ? breadId?.price2
              : item.pricetype === "toyxona"
              ? breadId?.price3
              : breadId.price,
          breadId: breadId || item.typeOfBreadIds[0],
        };
      }),
      ...soldBread1.map((item) => {
        let totalPrice =
          (item.pricetype === "tan"
            ? item?.breadId?.price
            : item.pricetype === "dokon"
            ? item?.breadId?.price2
            : item.pricetype === "toyxona"
            ? item?.breadId?.price3
            : 0) * item.quantity;
        let pending = totalPrice - item.money;
        return {
          ...item,
          totalPrice,
          pending,
          price:
            item.pricetype === "tan"
              ? item?.breadId?.price
              : item.pricetype === "dokon"
              ? item?.breadId?.price2
              : item.pricetype === "toyxona"
              ? item?.breadId?.price3
              : 0,
        };
      }),
    ].reduce((a, b) => {
      const excite = a.find((i) => String(i._id) == String(b._id));
      if (!excite) {
        a.push({ ...b });
      }
      return a;
    }, []);

    for (const key of allSoldBread) {
      if ((key?.totalPrice || 1) - key.money > 0) {
        pendingDelivery.push({ ...key });
      }
    }

    let magazineIds = pendingDelivery.reduce((acc, item) => {
      const excite = acc.find((b) => b === String(item.magazineId._id));
      if (!excite) {
        acc.push(String(item.magazineId._id));
      }
      return acc;
    }, []);
    let allMagazinePayed = 0;
    for (const key of magazineIds) {
      let magazinePayed = await MagazinePayedModel.aggregate([
        {
          $match: {
            magazineId: new mongoose.Types.ObjectId(key),
            createdAt: { $gte: startDay, $lte: endDay }
          },
        },
      ]);
      allMagazinePayed += magazinePayed.reduce((a, b) => a + b.pending, 0);
    }

    let orderWithDeliveries = await OrderWithDeliveryModel.aggregate([
      {
        $match: {
          deliveryId: new mongoose.Types.ObjectId(req.use.id),
          createdAt: { $gte: startDay, $lte: endDay },
          totalQuantity: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "deliveries",
          localField: "deliveryId",
          foreignField: "_id",
          as: "deliveryDetails",
        },
      },
      { $unwind: "$deliveryDetails" },
      {
        $unwind: "$typeOfBreadIds",
      },
      {
        $lookup: {
          from: "managerwares",
          localField: "typeOfBreadIds.bread",
          foreignField: "_id",
          as: "breadDetail",
        },
      },
      {
        $unwind: { path: "$breadDetail", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "typeofbreads",
          localField: "breadDetail.bread",
          foreignField: "_id",
          as: "breadTypeDetail",
        },
      },
      {
        $unwind: {
          path: "$breadTypeDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          adminId: { $first: "$adminId" },
          deliveryId: {
            $first: {
              username: "$deliveryDetails.username",
            },
          },
          description: { $first: "$description" },
          pricetype: { $first: "$pricetype" },
          totalQuantity: { $first: "$totalQuantity" },
          totalQuantity2: { $first: "$totalQuantity2" },
          createdAt: { $first: "$createdAt" },
          typeOfBreadIds: {
            $push: {
              breadId: "$typeOfBreadIds.bread",
              quantity: "$typeOfBreadIds.quantity",
              breadId: "$breadTypeDetail",
            },
          },
        },
      },
    ]);
    orderWithDeliveries = orderWithDeliveries.map((item) => {
      return {
        ...item,
        totalPrice: item.typeOfBreadIds?.reduce(
          (a, b) =>
            a +
            (item.pricetype === "tan"
              ? b?.breadId?.price
              : item.pricetype === "dokon"
              ? b?.breadId?.price2
              : item.pricetype === "toyxona"
              ? b?.breadId?.price3
              : b?.breadId?.price) *
              b.quantity,
          0
        ),
      };
    });

    return res.status(200).json({
      debt: {
        totalPrice: DeliveryDebts.reduce((a, b) => a + b.price, 0),
        history: DeliveryDebts,
      },
      pending: {
        totalPrice:
          pendingDelivery.reduce((a, b) => a + b.pending, 0) - allMagazinePayed,
        history: pendingDelivery,
      },
      soldBread: {
        totalPrice: allSoldBread.reduce((a, b) => a + b.totalPrice, 0),
        history: allSoldBread,
      },
      orderWithDeliveries: {
        totalQuantity: orderWithDeliveries.reduce(
          (a, b) => a + b.totalQuantity2,
          0
        ),
        totalQuantity2: orderWithDeliveries.reduce(
          (a, b) => a + (b.status ? b.totalQuantity : 0),
          0
        ),
        history: orderWithDeliveries,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const sellerStatics = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDay = new Date(today);
  const endDay = new Date(today);
  endDay.setHours(23, 59, 59, 999);

  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const diffToSunday = 7 - dayOfWeek;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + diffToSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  try {
    let sellerPayeds = await SellerPayedModel.aggregate([
      {
        $match: {
          sellerId: new mongoose.Types.ObjectId(req.use.id),
          active: true,
        },
      },
    ]);
    sellerPayeds = sellerPayeds.reduce((a, b) => {
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
        case "O`chirildi":
          return a - b?.price;
          break;
        default:
          break;
      }
    }, 0);
    const sellerBreads = await getSellerBread(
      { use: { role: "seller", id: req.use.id } },
      undefined
    );
    return res.status(200).json({
      payeds: sellerPayeds,
      sellerBreads,
    });
  } catch (error) {
    console.error(error);
  }
};
