const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const cloudinary = require("cloudinary");
const addProduct = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    console.log(req.body, "Add product body");
    console.log(req.files, "Add product files");
    const { productName, category, price, description, stock } = req.body;

    // Validate category
    const categoryFound = await categoryModel.findById(category);
    console.log("categoryFound", categoryFound);

    if (!categoryFound) {
      return res.status(400).send({
        success: false,
        message: "Category not found",
      });
    }
    if (!req.files) {
      return res
        .status(400)
        .send({ success: false, message: "No files uploaded." });
    }
    console.log(req.files);

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "No files uploaded." });
    }
    // Collect Cloudinary URLs from multer
    const imageUrls = req.files.map((file) => file.path);

    // Create new product with the image URLs
    const newProduct = await productModel.create({
      sellerId,
      productName,
      category: categoryFound._id,
      categoryName: categoryFound.name,
      price,
      description,
      images: imageUrls,
      stock,
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
// Update product information, including images
const updateProduct = async (req, res) => {
  try {
    console.log("hii");

    const productId = req.params.id;
    const { name, category, price, description, stock } = req.body;

    // Fetch existing product
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // If new images are provided, upload them to Cloudinary
    let imageUrls = product.images;
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of imageUrls) {
        const publicId = image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`product/${publicId}`);
      }

      // Upload new images and update image URLs
      imageUrls = req.files.map((file) => file.path);
    }

    // Update product fields
    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price || product.price;
    product.description = description || product.description;
    product.stock = stock || product.stock;
    product.images = imageUrls;

    // Save the updated product
    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.query.id;

    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    // Delete images from Cloudinary, skipping any `null` entries
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image) {
          // Only proceed if image is not null
          const publicId = image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`product/${publicId}`);
        }
      }
    }

    // Delete the product from the database
    await productModel.findByIdAndDelete(productId);

    res
      .status(200)
      .send({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const productId = req.query.productId;

    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Return the product
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error in getSingleProduct:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // Find the products
    const products = await productModel.find({});
    // console.log(products);

    if (!products) {
      return res
        .status(404)
        .json({ success: false, message: "Products not found" });
    }

    // Return all products
    res.status(200).send({ success: true, data: products });
  } catch (error) {
    console.error("Error in getSingleProduct:", error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.seller._id; // Extract sellerId from authenticated seller
    // console.log(sellerId, "Seller Id");

    // Query products by sellerId
    const products = await productModel.find({ sellerId });

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this seller." });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch products. Please try again later." });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  getAllProducts,
  getProductsBySeller,
  getProductDetails,
};
