const express = require("express");
const router = express.Router();
const {
  addSubcategory,
  getAllSubcategories,
  deleteSubcategory,
} = require("../controller/subcategorycontroller");
const { IsSeller } = require("../middleware/authMiddleware");

// Route to add a subcategory
router.post("/add-subcategory", IsSeller, addSubcategory);

// Route to get all subcategories
router.get("/get-all", getAllSubcategories);

// Route to delete a subcategory by ID
router.delete("/delete", deleteSubcategory);

module.exports = router;
