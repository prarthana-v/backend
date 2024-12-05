const express = require("express");
const {
  Isadmin,
  IsAdmin,
  thatverified,
} = require("../middleware/authMiddleware");
const router = express.Router();
const {
  addCategory,
  getCategories,
  deleteCategory,
  updatedCategory,
  getCategoryById,
  reorderCategories,
} = require("../controller/categoryController");

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "category", // Folder in Cloudinary where images will be stored
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post(
  "/add-category",
  thatverified,
  upload.single("categoryImage"), // Match frontend field name
  async (req, res) => {
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);
    await addCategory(req, res); // Pass req, res to the addCategory controller
  }
);

router.get("/categories", getCategories);
router.delete("/delete-category/:id", thatverified, deleteCategory);

router.put(
  "/update-category/:id",
  thatverified,
  upload.single("categoryImage"),
  async (req, res) => {
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);
    await updatedCategory(req, res);
  }
);

router.get("/getCategory/:id", getCategoryById);

router.post("/reorder-categories", reorderCategories);

module.exports = router;
