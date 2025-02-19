const express = require("express");
const router = express.Router();
const {
  addSubcategory,
  getAllSubcategories,
  deleteSubcategory,
  updateSubcategory,
  reorderSubcategories,
} = require("../controller/subcategorycontroller");
const {
  Isadmin,
  IsAdmin,
  thatverified,
} = require("../middleware/authMiddleware");

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
  upload.single("subcategoryImage"),
  (req, res, next) => {
    // console.log(req.body, "non-file fields"); // Non-file fields
    // console.log(req.file, "files"); // Uploaded files
    next(); // Proceed to the addProduct controller
  },
  addSubcategory
);

// Route to get all subcategories
router.get("/getsubcategories", getAllSubcategories);

// Route to delete a subcategory by ID
router.delete("/delete-subcategory/:id", thatverified, deleteSubcategory);

router.put(
  "/update-subcategory/:id",
  thatverified,
  upload.single("subcategoryImage"), // Middleware for image upload
  (req, res, next) => {
    console.log(req.body, "non-file fields"); // Non-file fields
    console.log(req.file, "file"); // Uploaded files
    next(); // Proceed to the addProduct controller
  },
  updateSubcategory
);

router.post("/reorder-subcategories", reorderSubcategories);

module.exports = router;
