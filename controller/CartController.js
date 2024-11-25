const CartItems = require("../models/CartItemsModel");
const Product = require("../models/productModel");
const Cart = require("../models/CartModel");
const CartItem = require("../models/CartItemsModel");
const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    console.log(req.body);

    let cart = await Cart.findOne({ userId }).populate("cartitems");
    if (!cart) {
      cart = new Cart({ userId, cartitems: [] });
    }

    const existingItem = cart.cartitems.find(
      (item) => item.productId.toString() === productId.toString()
    );

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    const price = product.price;
    const productDiscount = product.discount || 0; // Use product-specific discount or default to 0%

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      existingItem.price = price;
      await existingItem.save();
    } else {
      const cartItem = new CartItem({
        userId,
        productId,
        quantity: Number(quantity),
        price,
      });
      await cartItem.save();
      cart.cartitems.push(cartItem);
    }

    cart.totalPrice = cart.cartitems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Calculate total discount based on each item's product discount
    cart.discount = cart.cartitems.reduce((acc, item) => {
      const itemDiscount =
        (item.price * item.quantity * (item.productId.discount || 0)) / 100;
      return acc + itemDiscount;
    }, 0);

    cart.totalDiscountedPrice = cart.totalPrice - cart.discount;

    // Calculate total items
    cart.totalItems = cart.cartitems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    await cart.save();

    res
      .status(201)
      .send({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    console.log(error);

    res.status(500).send({ success: false, message: error });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId }).populate({
      path: "cartitems",
      populate: {
        path: "productId",
        model: "Product", // Ensure this matches your Product model name
        select: "name price category image", // Adjust fields based on what you need
      },
    });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Respond with the cart details, including items and total price
    res.status(200).json({
      success: true,
      data: {
        items: cart.cartitems,
        totalPrice: cart.totalPrice,
      },
    });
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve cart",
      error,
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId is available from authentication
    const { cartItemId } = req.query.id; // ID of the item to delete

    // Find the user's cart
    let cart = await Cart.findOne({ userId }).populate("cartitems");
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Filter out the item to be deleted
    cart.cartitems = cart.cartitems.filter(
      (item) => item._id.toString() !== cartItemId
    );

    // Recalculate the total price
    cart.totalPrice = cart.cartitems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Error in deleteCartItem:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete item", error });
  }
};

const deleteCart = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId is available from authentication

    // Find the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Clear the cart items and reset the total price
    cart.cartitems = [];
    cart.totalPrice = 0;

    // Save the updated empty cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Error in deleteCart:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to clear cart", error });
  }
};

const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);

    const { productId, quantity } = req.body; // Extract the productId and quantity from the request body
    console.log(req.body);

    // Step 1: Find the user's cart
    let cart = await Cart.findOne({ userId }).populate("cartitems");
    if (!cart) {
      return res.status(404).send({
        success: false,
        message: "Cart not found",
      });
    }
    console.log("Cart found:", cart);

    // Step 2: Find the cart item to update
    const existingItem = cart.cartitems.find((item) => {
      return item.productId.toString() === productId.toString(); // Find the item by productId
    });

    if (!existingItem) {
      return res.status(404).send({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Step 3: Update the quantity and price of the item
    if (quantity <= 0) {
      return res.status(400).send({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // Fetch the product to get the updated price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    const price = product.price;

    // Update the item's quantity and price
    existingItem.quantity = quantity;
    existingItem.price = price;

    // Save the updated item back to the database
    await existingItem.save();

    // Step 4: Recalculate the total price of the cart
    cart.totalPrice = cart.cartitems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Save the updated cart
    await cart.save();

    // Step 5: Respond with the updated cart
    res.status(200).send({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Error in updateCart:", error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
};

module.exports = {
  addItemToCart,
  getCart,
  deleteCartItem,
  deleteCart,
  updateCart,
};
