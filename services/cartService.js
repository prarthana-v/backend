const CartItem = require("../models/CartItemsModel.js");
const Product = require("../models/productModel.js");
const CartModel = require("../services/cartService.js");

async function createcart(user) {
  try {
    const cart = new CartModel({ user });
    const createdCart = await cart.save();
    return;
    createdCart;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function findUserCart(userId) {
  try {
    const cart = await CartModel.findOne({ user: userId });
    const cartItems = await CartItem.find({ cart: cart._id }).populate(
      "productId"
    );
    cart.cartItems = cartItems;
    let totalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalItems = 0;

    for (const cartItem of cart.cartItems) {
      totalPrice += cartItem.price;
      totalDiscountedPrice += cartItem.discountedPrice;
      totalItems += cartItem.quantity;
    }

    cart.totalPrice = totalPrice;
    cart.totalItems = totalItems;
    cart.discount = totalPrice - totalDiscountedPrice;

    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function addcartItem(userId, req) {
  try {
    const cart = await cart.findOne({ user: userId });
    const product = await Product.findById(req.productId);

    const isPresent = CartItem.findOne({
      cart: cart._id,
      product: product._id,
      user: user._id,
    });

    if (!ispresent) {
      const cartItem = new CartItem.create({
        cart: cart._id,
        productId: product._id,
        quantity: 1,
        userId,
        price: product.price,
        size: req.size,
        discountedPrice: product.discountedPrice,
      });

      const createdcartitem = await cartItem.save();
      cart.cartItems.push(createdcartitem);
      await cart.save();

      return "Item added to cart";
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
module.exports = {
  createcart,
  addcartItem,
  findUserCart,
};
