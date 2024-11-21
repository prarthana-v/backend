const Order = require("../models/OrderModel");
const Product = require("../models/productModel");
const Cart = require("../models/CartModel");
const Seller = require("../models/sellerModel");

const placeOrder = async (req, res) => {
  try {
    // Step 1: Get user ID, items, payment method, and shipping address from request body
    const userId = req.user.id;
    const { items, paymentMethod, shippingAddress } = req.body;

    // Fetch the user's cart
    const cart = await Cart.findOne({ userId }).populate("cartitems");

    if (!cart || cart.cartitems.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Cart is empty",
      });
    }

    // Step 2: Validate payment method
    if (!["Online Payment", "Cash On Delivery"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Step 3: Prepare order items and calculate total amount

    // Fetch and prepare order items
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        // console.log(product, item);

        if (!product)
          throw new Error(`Product with ID ${item.product} not found`);

        return {
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          sellerId: product.sellerId,
        };
      })
    );

    let totalAmount = orderItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    if (isNaN(totalAmount)) {
      throw new Error("Calculation error: totalAmount is NaN");
    }

    const isCOD = paymentMethod === "Cash On Delivery";

    // Step 5: Create new order
    const newOrder = await Order.create({
      user: userId,
      products: orderItems,
      totalAmount,
      status: "Pending",
      paymentMethod: isCOD ? "Cash On Delivery" : paymentMethod,
      isCOD: isCOD || false,
      shippingAddress,
      paymentStatus: isCOD ? "Pending" : "Completed",
    });
    console.log(newOrder);

    // cart.cartitems = [];
    // cart.totalPrice = 0;
    // await cart.save();

    // Step 7: Respond with success message and order details
    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).populate(
      "products.productId",
      "name price"
    ); // Populate product details

    if (!orders || orders.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No orders found for this user",
      });
    }

    res.status(200).send({
      success: true,
      message: "order fetched successfully",
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(req.query);

    const order = await Order.findById(orderId).populate(
      "products.productId",
      "name price"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.query.id;
    const { status } = req.body;

    // Validate status
    if (!["Pending", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    console.log(order);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
};
