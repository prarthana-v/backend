const express = require("express");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  getAllProducts,
  getProductsByCategory,
  getProductsBySeller,
  getProductDetails,
} = require("../controller/productController");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const { IsSeller } = require("../middleware/authMiddleware");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "product", // Folder in Cloudinary where images will be stored
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage: storage });

// Middleware for checking the files
router.post(
  "/add-product",
  IsSeller,
  upload.array("images", 5),
  (req, res, next) => {
    console.log(req.body, "non-file fields"); // Non-file fields
    console.log(req.files, "files"); // Uploaded files
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }
    next(); // Proceed to the addProduct controller
  },
  addProduct
);

router.put(
  "/update-product/:id",
  IsSeller,
  upload.array("images"), // Accept multiple images
  (req, res, next) => {
    if (req.files && req.files.length > 0) {
      console.log("Uploaded files:", req.files); // Debugging
    }
    next(); // Proceed to the updateProduct controller
  },
  updateProduct
);

// Delete product route
router.delete("/delete-product", IsSeller, deleteProduct);
router.get("/get-product", IsSeller, getSingleProduct);
router.get("/getproductDetails/:id", getProductDetails);
router.get("/getallproducts", getAllProducts);
router.get("/getproductsbyseller", IsSeller, getProductsBySeller);
router.get("/by-category", getProductsByCategory);
module.exports = router;
