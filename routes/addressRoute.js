const express = require("express");
const { ISUser } = require("../middleware/authMiddleware");
const {
  addAddress,
  editAddress,
  getAddressesByUserId,
  deleteAddress,
} = require("../controller/addressController");
const router = express.Router();

router.post("/add-address", ISUser, addAddress);
router.put("/edit-address/:id", ISUser, editAddress);
router.get("/getadresses", ISUser, getAddressesByUserId);
router.delete("/delete-address", ISUser, deleteAddress);

module.exports = router;
