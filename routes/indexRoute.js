const express = require("express");
const routes = express.Router();

routes.use("/api/auth", require("./authRoute"));
routes.use("/api/seller", require("./sellerRoute"));
routes.use("/api/category", require("../routes/categoryRoute"));
routes.use("/api/product", require("./productRoute"));
routes.use("/api/cart", require("../routes/CartRoute"));
routes.use("/api/orders", require("./orderRoute"));
routes.use("/api/subcategory", require("./subcategoryRoute"));
routes.use("/api/superadmin", require("./superAdminRt/SuperAdminroute"));

module.exports = routes;
