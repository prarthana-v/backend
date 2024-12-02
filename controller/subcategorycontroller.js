const SubcategoryModel = require("../models/subcategoryModel");
const categoryModel = require("../models/categoryModel");

const addSubcategory = async (req, res) => {
  try {
    const superadminId = req.superadmin.id;
    const { categoryId, subcategoryName } = req.body;
    console.log(req.superadmin, req.body, req.file, "a");

    // Ensure both categoryId and name are provided
    if (!categoryId || !subcategoryName) {
      return res.status(400).send({ message: "All fields are required." });
    }

    // Check if the category exists
    const category = await categoryModel.findById(categoryId);
    console.log(category, "cat");
    if (!category) {
      return res.status(400).json({ message: "Category not found." });
    }

    // Check if the subcategory already exists
    const existingSubcategory = await SubcategoryModel.findOne({
      subcategoryName,
    });
    if (existingSubcategory) {
      return res.status(400).send({
        success: false,
        message: "Subcategory already exists",
      });
    }

    const image = req.file ? req.file.path : "";
    console.log(image, "image");

    // Create the new subcategory, including the categoryId
    const subcategory = await SubcategoryModel.create({
      superadminId,
      categoryId, // Make sure to pass the categoryId here
      subcategoryName,
      image,
    });
    console.log(subcategory, "subcategory");
    // Populate the categoryId field with the corresponding category details
    const populatedSubcategory = await subcategory.populate(
      "categoryId",
      "categoryName image"
    );

    // Return the populated subcategory
    res.status(201).json({
      message: "Subcategory created successfully.",
      subcategory: populatedSubcategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Get All Subcategories
const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await SubcategoryModel.find()
      .populate("superadminId", "name email") // Populate seller details if needed
      .populate("categoryId", "categoryName image"); // Populate category details

    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Delete Subcategory
const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subcategory exists
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found." });
    }

    await Subcategory.findByIdAndDelete(id);
    res.status(200).json({ message: "Subcategory deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = {
  addSubcategory,
  getAllSubcategories,
  deleteSubcategory,
};
