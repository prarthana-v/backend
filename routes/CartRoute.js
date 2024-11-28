const express = require("express");
const router = express.Router();

const {
  addItemToCart,
  getCart,
  deleteCartItem,
  clearCart,
  updateItemInCart,
} = require("../controller/CartController");
const { IsLoggedIn } = require("../middleware/authMiddleware");

router.post("/add-item", IsLoggedIn, addItemToCart);
router.get("/getcart", IsLoggedIn, getCart);
router.delete("/delete-item", IsLoggedIn, deleteCartItem);
router.delete("/clearcart", IsLoggedIn, clearCart);
router.put("/update-item", IsLoggedIn, updateItemInCart);

module.exports = router;
