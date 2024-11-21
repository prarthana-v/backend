const express = require("express");
const {
  placeOrder,
  getOrderDetails,
  getUserOrders,
  updateOrderStatus,
} = require("../controller/orderController");
const { IsLoggedIn, Isadmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/place-order", IsLoggedIn, placeOrder);
router.get("/my-orders", IsLoggedIn, getUserOrders);
router.get("/:orderId", IsLoggedIn, getOrderDetails);
router.put("/:orderId/status", IsLoggedIn, Isadmin, updateOrderStatus);

module.exports = router;
