const express = require("express");
const { route } = require("./productRoute");
const routes = express.Router();

routes.use("/api/auth", require("./authRoute"));
routes.use("/api/seller", require("./adminRoute"));
routes.use("/api/category", require("../routes/categoryRoute"));
routes.use("/api/product", require("./productRoute"));
routes.use("/api/cart", require("../routes/CartRoute"));
routes.use("/api/order", require("./orderRoute"));
routes.use("/api/subcategory", require("./subcategoryRoute"));

module.exports = routes;
