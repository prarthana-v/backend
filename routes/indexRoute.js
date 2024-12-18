const express = require("express");
const routes = express.Router();

routes.use("/api/auth", require("./authRoute"));
routes.use("/api/seller", require("./sellerRoute"));
routes.use("/api/category", require("../routes/categoryRoute"));
routes.use("/api/product", require("./productRoute"));
routes.use("/api/cart", require("../routes/CartRoute"));
routes.use("/api/orders", require("./orderRoute"));
routes.use("/api/subcategory", require("./subcategoryRoute"));

const SuperAdminroute = require("./SuperAdminRoute");
const BannerRoute = require("./BannerRoute");
const addressRoute = require("./addressRoute");
routes.use("/api/superadmin", SuperAdminroute);
routes.use("/api/superadmin", BannerRoute);
routes.use("/api/address", addressRoute);

module.exports = routes;
