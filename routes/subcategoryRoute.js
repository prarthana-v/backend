const express = require("express");
const router = express.Router();
const {
  addSubcategory,
  getAllSubcategories,
  deleteSubcategory,
} = require("../controller/subcategorycontroller");
const { Isadmin, IsAdmin } = require("../middleware/authMiddleware");

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
    folder: "subcategory", // Folder in Cloudinary where images will be stored
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage: storage });

// Route to add a subcategory
router.post(
  "/add-subcategory",
  IsAdmin,
  upload.single("image"),
  addSubcategory
);

// Route to get all subcategories
router.get("/getsubcategories", getAllSubcategories);

// Route to delete a subcategory by ID
router.delete("/delete", IsAdmin, deleteSubcategory);

module.exports = router;
