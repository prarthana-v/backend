const express = require("express");
const router = express.Router();

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const { thatverified } = require("../middleware/authMiddleware");
const {
  addBannerImage,
  deleteBanner,
  reorderBanner,
  fetchBannerbyOrder,
} = require("../controller/SuperAdminCt/BannerController");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "banners", // Folder in Cloudinary where images will be stored
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post(
  "/add-banner",
  thatverified,
  upload.single("image"),
  async (req, res, next) => {
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);
    next();
  },
  addBannerImage
);

router.delete("/delete-banner/:id", thatverified, deleteBanner);
router.put(
  "/reorder-banner",
  thatverified,
  upload.single("image"),
  reorderBanner
);
router.get("/banners", fetchBannerbyOrder);

module.exports = router;
