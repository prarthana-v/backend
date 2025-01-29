const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const subcategoryModel = require("../models/subcategoryModel");
const cloudinary = require("cloudinary");
const mongoose = require("mongoose");

const addProduct = async (req, res) => {
  try {
    const sellerId = req.seller._id; // Authenticated seller ID
    const {
      productName,
      category,
      subcategory, // Added subcategory
      price,
      mrp,
      skuid,
      description,
      stock,
      sizes,
      color,
      sleeveLength,
      material,
      occasion,
      pattern,
      manufacturerDetails,
      packerDetails,
    } = req.body;

    // Validate required fields
    if (
      !productName ||
      !category ||
      !price ||
      !description ||
      stock == null ||
      !skuid ||
      !mrp
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Missing required fields: productName, category, price, mrp, skuid, description, or stock.",
      });
    }

    // Validate price and stock
    if (price <= 0 || stock < 0) {
      return res.status(400).send({
        success: false,
        message: "Price must be greater than 0 and stock cannot be negative.",
      });
    }

    // Convert sizes to an array if it's a comma-separated string
    const sizesArray = typeof sizes === "string" ? sizes.split(",") : sizes;

    // Check category and subcategory existence
    const categoryFound = await categoryModel.findById(category);
    if (!categoryFound) {
      return res
        .status(404)
        .send({ success: false, message: "Category not found." });
    }

    const subcategoryFound = subcategory
      ? await subcategoryModel.findById(subcategory)
      : null;

    if (subcategory && !subcategoryFound) {
      return res
        .status(404)
        .send({ success: false, message: "Subcategory not found." });
    }

    // Validate file uploads
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "No files uploaded." });
    }

    const imageUrls = req.files.map((file) => file.path); // Collect image URLs

    // Create new product
    const newProduct = await productModel.create({
      sellerId,
      productName,
      categoryId: categoryFound._id,
      categoryName: categoryFound.categoryName,
      subcategoryId: subcategoryFound?._id || null,
      subcategoryName: subcategoryFound?.subcategoryName || null,
      price,
      mrp,
      skuid,
      description,
      images: imageUrls,
      stock,
      sizes: sizesArray,
      color,
      sleeveLength,
      material,
      occasion,
      pattern,
      manufacturerDetails,
      packerDetails,
    });

    res.status(201).send({
      success: true,
      message: "Product created successfully.",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).send({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};
// Update product information, including images
const updateProduct = async (req, res) => {
  try {
    console.log("hii");

    const productId = req.params.id;
    const {
      productName,
      category,
      price,
      description,
      stock,
      color,
      sleeveLength,
      material,
      occasion,
      pattern,
      fit,
      manufacturerDetails,
      packerDetails,
      sizes,
    } = req.body;

    // Fetch existing product
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
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

    // Update product fields, leaving the current values if no new data is provided
    product.productName = productName || product.productName;
    product.category = category || product.category;
    product.price = price || product.price;
    product.description = description || product.description;
    product.stock = stock || product.stock;
    product.color = color || product.color;
    product.sleeveLength = sleeveLength || product.sleeveLength;
    product.material = material || product.material;
    product.occasion = occasion || product.occasion;
    product.pattern = pattern || product.pattern;
    product.fit = fit || product.fit;
    product.manufacturerDetails =
      manufacturerDetails || product.manufacturerDetails;
    product.packerDetails = packerDetails || product.packerDetails;
    product.sizes = sizes || product.sizes; // Ensure sizes are updated
    product.images = imageUrls; // Update images to the new ones if provided

    // Save the updated product
    await product.save();

    res.status(200).send({ success: true, data: product });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).send({ success: false, message: "Server error", error });
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
        .send({ success: false, message: "Product not found" });
    }

    // Return the product
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    console.error("Error in getSingleProduct:", error);
    res.status(500).send({ success: false, message: "Server error", error });
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
        .send({ success: false, message: "Products not found" });
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
        .send({ message: "No products found for this seller." });
    }

    res.status(200).send({
      success: true,
      products: products,
    });
  } catch (error) {
    console.error(error, "prathna");
    res
      .status(500)
      .send({ message: "Failed to fetch products. Please try again later." });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.status(200).send(product);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const categoryName = req.query.categoryName; // Pass categoryName as a query paramete
    if (!categoryName) {
      return res
        .status(400)
        .send({ success: false, message: "Category name is required." });
    }

    const products = await productModel.find({
      categoryName: categoryName,
    });

    if (products.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No products found for this category.",
      });
    }

    // Get the total count of products
    res.status(200).send({ success: true, data: products });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const getProductsBySubategory = async (req, res) => {
  try {
    const { subcategoryName, color } = req.query; // Pass categoryName as a query paramete
    console.log(subcategoryName, color, "scn");
    if (!subcategoryName) {
      return res
        .status(400)
        .send({ success: false, message: "subcategory name is required." });
    }

    const filter = { subcategoryName };
    if (color) {
      filter.color = { $in: color.split(",") }; // Use $in operator for multiple values
    }

    console.log(filter, "filter");
    // const products = await productModel
    //   .find({
    //     subcategoryName,
    //   })
    //   .select("productName images categoryName color");

    const products = await productModel
      .find(filter)
      .select("productName images categoryName price color");

    console.log(products, "products");

    if (products.length === 0) {
      return res.status(404).send({
        success: false,
        message:
          "No products found for this subcategory with the applied filters.",
      });
    }

    // Get the total count of products
    res.status(200).send({ success: true, data: products });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

const Search = async (req, res) => {
  const { query } = req.query;
  const page = parseInt(req.query.page) || 1;
  console.log(req.query);

  if (!query) {
    return res.status(400).send({ message: "Search query is required" });
  }

  try {
    // Create a case-insensitive regex pattern
    const regex = new RegExp(query, "i"); // 'i' for case-insensitive search
    // console.log(new RegExp(query, "i"));
    const pageSize = 5;

    const categories = await categoryModel.find({
      categoryName: { $regex: regex },
    });
    const categoryIds = categories.map((c) => c._id);
    // console.log(categories);

    const subcategories = await subcategoryModel.find({
      subcategoryName: { $regex: regex },
    });
    // console.log(subcategories);

    // Search products, categories, and subcategories with regex
    const products = await productModel
      .find({
        $or: [
          { productName: { $regex: regex } },
          { description: { $regex: regex } },
          { categoryId: { $in: categoryIds } }, // Match products by category
        ],
      })
      .select("productName images description categoryId") // Only return necessary fields
      .limit(pageSize);
    // console.log(products);

    // Return the results
    res.send({
      success: true,
      message: "search result",
      products: products,
      categories: categories,
      subcategories: subcategories,
    });
  } catch (err) {
    console.error("Error during search:", err);
    res.status(500).send({ message: "Server error" });
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
  getProductsByCategory,
  getProductsBySubategory,
  Search,
};
