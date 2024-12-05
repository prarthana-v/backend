const Banner = require("../../models/SuperAdminMd/BannerModel");
const cloudinary = require("cloudinary").v2;

const addBannerImage = async (req, res) => {
  try {
    const superadminId = req.user._id;
    const { title } = req.body;
    const image = req.file ? req.file.path : "";

    // Get the last banner sorted by sortOrder
    const lastBanner = await Banner.findOne().sort({ sortOrder: -1 });

    // Calculate the next sortOrder
    const sortOrder = lastBanner ? lastBanner.sortOrder + 1 : 0;

    // Create a new banner
    const newBanner = new Banner({
      title,
      image,
      sortOrder,
    });

    await newBanner.save();

    res.status(201).json({
      success: true,
      message: "Banner added successfully.",
      banner: newBanner,
    });
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add banner.",
    });
  }
};

// Reorder banners
const reorderBanner = async (req, res) => {
  try {
    const reorderedBanners = req.body; // [{ _id: "id1", sortOrder: 0 }, ...]
    console.log(req.body, reorderBanner);
    if (!Array.isArray(reorderedBanners)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format. Expected an array of banners.",
      });
    }

    // Bulk write operation for efficient updates
    const bulkOperations = reorderedBanners.map((banner) => ({
      updateOne: {
        filter: { _id: banner._id },
        update: { sortOrder: banner.sortOrder },
      },
    }));

    await Banner.bulkWrite(bulkOperations);

    res.status(200).json({
      success: true,
      message: "Banners reordered successfully.",
    });
  } catch (error) {
    console.error("Error reordering banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder banners.",
    });
  }
};

const getPublicIdFromUrl = (url) => {
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the banner to get the public_id of the Cloudinary image
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found.",
      });
    }
    // image delete from cloudinary
    if (banner.image) {
      const publicId = getPublicIdFromUrl(banner.image);
      console.log(publicId, banner.image);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary deletion result:", result);
      } else {
        console.log("Could not extract publicId from image URL:", banner.image);
      }
    }

    await Banner.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete banner.",
    });
  }
};

const fetchBannerbyOrder = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1 });

    res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners.",
    });
  }
};

module.exports = {
  addBannerImage,
  reorderBanner,
  deleteBanner,
  fetchBannerbyOrder,
};
