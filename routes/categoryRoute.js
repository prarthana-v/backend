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
const upload = multer({ storage: storage });
router.post("/add-category", thatverified, addCategory);
router.get("/categories", IsAdmin, getCategories);
router.delete("/delete-category", IsAdmin, deleteCategory);

router.put(
  "/update-category",
  IsAdmin,
  upload.single("image"),
  updatedCategory
);

router.get("/getCategory", getCategoryById);

module.exports = router;
