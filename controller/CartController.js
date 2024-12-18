const CartItems = require("../models/CartItemsModel");
const Product = require("../models/productModel");
const Cart = require("../models/CartModel");
const CartItem = require("../models/CartItemsModel");

const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Find the cart associated with the user
    let cart = await Cart.findOne({ userId }).populate("cartitems");
    if (!cart) {
      cart = new Cart({ userId, cartitems: [] });
    }
    console.log(cart, "cart");
    // Find the product by ID
    const product = await Product.findById(productId);
    console.log(product, "product");
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    const price = product.price;
    const productName = product.productName;
    const productDiscount = 0; // Use product-specific discount or default to 0%

    // Ensure price and quantity are valid numbers
    if (isNaN(price) || isNaN(quantity) || quantity <= 0) {
      return res.status(400).send({
        success: false,
        message: "Invalid product price or quantity",
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.cartitems.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      // Update existing cart item
      existingItem.quantity += Number(quantity);
      existingItem.totalPrice = existingItem.quantity * price;
      if (isNaN(existingItem.totalPrice)) {
        console.error("Invalid total price for existing item:", existingItem);
      }
      await existingItem.save();
    } else {
      // Create new cart item
      const cartItem = new CartItem({
        productId: productId,
        productName: productName,
        price: price,
        quantity: Number(quantity),
        totalPrice: price * Number(quantity),
      });

      // Check if totalPrice is valid
      if (isNaN(cartItem.totalPrice)) {
        console.error("Invalid total price for new cart item:", cartItem);
      }

      await cartItem.save();
      cart.cartitems.push(cartItem);
    }

    // Calculate total cart amount (sum of all items' totalPrice)
    const totalAmount = cart.cartitems.reduce((acc, item) => {
      if (isNaN(item.totalPrice)) {
        console.error("NaN detected in item totalPrice:", item);
        return acc;
      }
      return acc + item.totalPrice;
    }, 0);

    // Validate the total amount
    if (isNaN(totalAmount)) {
      console.error(
        "Calculated cartTotalAmt is NaN. Cart items:",
        cart.cartitems
      );
      return res.status(500).send({
        success: false,
        message: "Error calculating total cart amount",
      });
    }

    cart.cartTotalAmt = totalAmount;

    // Calculate total discount
    const totalDiscount = cart.cartitems.reduce((acc, item) => {
      console.log("discount", item);
      const itemDiscount = (item.totalPrice * (item.discount || 0)) / 100;
      return acc + itemDiscount;
    }, 0);

    cart.discount = totalDiscount;
    cart.totalDiscountedPrice = cart.cartTotalAmt - cart.discount;

    // Calculate total number of items in the cart
    cart.cartTotalItems = cart.cartitems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    // Save the cart to the database
    await cart.save();

    // Respond with updated cart
    res.status(201).send({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("Error in addItemToCart:", error);
    res.status(500).send({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
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
        select: "images sizes", // Adjust fields based on what you need
      },
    });

    if (!cart) {
      return res
        .status(404)
        .send({ success: false, message: "Cart not found" });
    }

    // Respond with the cart details, including items and total price
    res.status(200).send({
      success: true,
      data: {
        cart: cart,
      },
    });
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).send({
      success: false,
      message: "Failed to retrieve cart",
      error,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Remove all cart items associated with the cart
    await CartItem.deleteMany({ _id: { $in: cart.cartitems } });

    // Reset the cart
    cart.cartitems = [];
    cart.cartTotalAmt = 0;
    cart.cartTotalItems = 0;
    cart.discount = 0;
    cart.totalDiscountedPrice = 0;

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId is available from authentication
    const cartItemId = req.body.id; // Correct query parameter extraction
    console.log(req.body);

    // Find the user's cart
    let cart = await Cart.findOne({ userId }).populate("cartitems");
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Find the item to be deleted
    const itemToDelete = cart.cartitems.find(
      (item) => item._id.toString() === cartItemId
    );
    if (!itemToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    // Remove the CartItem document from the database
    await CartItem.findByIdAndDelete(cartItemId);

    // Filter out the deleted item from the cart's items array
    cart.cartitems = cart.cartitems.filter(
      (item) => item._id.toString() !== cartItemId
    );

    // Recalculate cart totals
    cart.cartTotalAmt = cart.cartitems.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );
    cart.cartTotalItems = cart.cartitems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    // Recalculate discount and total discounted price
    cart.discount = cart.cartitems.reduce(
      (acc, item) =>
        acc + (item.totalPrice * (item?.product?.discount || 0)) / 100,
      0
    );
    cart.totalDiscountedPrice = cart.cartTotalAmt - cart.discount;

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Error in deleteCartItem:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
};

const updateItemInCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    console.log(req.body);

    // Validate product and quantity
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    // Find the cart associated with the user
    let cart = await Cart.findOne({ userId }).populate("cartitems");
    if (!cart) {
      cart = new Cart({ userId, cartitems: [] });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!!",
      });
    }

    const { price, discount: productDiscount = 0 } = product;

    // Check if the item already exists in the cart
    const existingItem = cart.cartitems.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingItem) {
      // Update existing cart item
      existingItem.quantity = Number(quantity);
      existingItem.totalPrice = price * existingItem.quantity;

      // Save the updated item
      await existingItem.save();
    } else {
      // Add new item to the cart if it doesn't exist
      const newCartItem = new CartItem(
        {
          productId,
          quantity: Number(quantity),
          totalPrice: price * Number(quantity),
        },
        { new: true }
      );

      await newCartItem.save();
      cart.cartitems.push(newCartItem);
    }

    // Recalculate total price (sum of all cart items' totalPrice)
    const totalAmount = cart.cartitems.reduce((acc, item) => {
      if (isNaN(item.totalPrice)) {
        console.error("Invalid totalPrice for item:", item);
        return acc;
      }
      return acc + item.totalPrice;
    }, 0);

    // Update cart's total price
    cart.cartTotalAmt = totalAmount;

    // Calculate total discount for all items
    const totalDiscount = cart.cartitems.reduce((acc, item) => {
      const itemDiscount =
        (item.totalPrice * (item.productId.discount || 0)) / 100;
      return acc + itemDiscount;
    }, 0);

    // Update cart's discount and total discounted price
    cart.discount = totalDiscount;
    cart.totalDiscountedPrice = totalAmount - totalDiscount;

    // Update the total number of items in the cart
    cart.cartTotalItems = cart.cartitems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    // Save the updated cart
    await cart.save();

    // Return the updated cart data
    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Error in updateItemInCart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message,
    });
  }
};

module.exports = {
  addItemToCart,
  getCart,
  deleteCartItem,
  clearCart,
  updateItemInCart,
};
