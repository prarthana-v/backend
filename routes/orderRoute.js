const express = require("express");
const {
  placeOrder,
  getOrderDetails,
  getOrdersByUser,
  updateOrderStatus,
  getOrdersBySeller,
  updateOrderByStatus,
} = require("../controller/orderController");
const {
  IsLoggedIn,
  Isadmin,
  IsSeller,
} = require("../middleware/authMiddleware");
const router = express.Router();

// users
router.post("/place-order", IsLoggedIn, placeOrder);
router.get("/getordersbyuser", IsLoggedIn, getOrdersByUser);
router.get("/getordersbyseller", IsSeller, getOrdersBySeller);
// router.get("/:orderId", IsLoggedIn, getOrderDetails);
router.put("/:orderId/status", IsSeller, updateOrderByStatus);
module.exports = router;
