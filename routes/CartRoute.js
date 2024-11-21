const express = require("express");
const router = express.Router();

const {
  addItemToCart,
  getCart,
  deleteCartItem,
  deleteCart,
  updateCart,
} = require("../controller/CartController");
const { IsLoggedIn } = require("../middleware/authMiddleware");

router.post("/add-item", IsLoggedIn, addItemToCart);
router.get("/getcart", IsLoggedIn, getCart);
router.delete("/delete-item", IsLoggedIn, deleteCartItem);
router.delete("/deletecart", IsLoggedIn, deleteCart);
router.post("/update-cart", IsLoggedIn, updateCart);

module.exports = router;
