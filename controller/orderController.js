const Order = require("../models/OrderModel");
const Product = require("../models/productModel");
const Cart = require("../models/CartModel");
const Seller = require("../models/sellerModel");
const mongoose = require("mongoose");
const Address = require("../models/AddressModel");

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod } = req.body;
    console.log(req.user, "user", items, shippingAddress, paymentMethod);

    // Verify if the shippingAddress exists
    const addressExists = await Address.findById(shippingAddress);
    if (!addressExists) {
      return res.status(404).send({
        success: false,
        message: "Invalid shipping address ID",
      });
    }
    console.log(addressExists.user.toString(), userId);

    // Check if the address belongs to the logged-in user
    if (addressExists.user.toString() !== userId) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to use this address",
      });
    }

    // Validate payment method
    if (!paymentMethod) {
      return res.status(400).send({
        success: false,
        message: "Payment method is required",
      });
    }

    // Fetch the user's cart
    const cart = await Cart.findOne({ userId }).populate("cartitems");
    if (!cart || cart.cartitems.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Cart is empty",
      });
    }

    // Prepare order items and calculate total amount
    const orderItems = await Promise.all(
      items.map(async (item) => {
        // Access productId._id instead of item.productId directly
        const product = await Product.findById(item.productId._id);
        console.log("product", product);
        if (!product)
          throw new Error(`Product with ID ${item.productId._id} not found`);

        return {
          productId: product._id,
          productName: item.productName, // Include product name from the payload
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
          sellerId: product.sellerId,
        };
      })
    );

    let totalAmount = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    if (isNaN(totalAmount)) {
      throw new Error("Calculation error: totalAmount is NaN");
    }

    // Create new order
    const newOrder = await Order.create({
      user: userId,
      Items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    // Update stock for each product
    await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        product.stock -= item.quantity;
        await product.save();
      })
    );

    // Respond with success message
    res.status(201).send({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
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

const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user?.id; // Get userId from query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // Filter and pagination logic
    const skip = (page - 1) * limit;
    const filter = { user: new mongoose.Types.ObjectId(userId) };
    const Address = require("../models/AddressModel");

    // Query the database
    const orders = await Order.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ orderDate: -1 });

    const totalOrders = await Order.countDocuments(filter); // Total number of orders for this user
    const totalPages = Math.ceil(totalOrders / limit);

    // Response
    res.status(200).send({
      success: true,
      message: "Orders retrieved successfully",
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Error in getOrdersByUser:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

const getOrdersBySeller = async (req, res) => {
  try {
    // console.log("sellerId in getordersbyseller", req.seller);
    const sellerId = req.seller?._id; // Get userId from query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!sellerId) {
      return res.status(400).json({ message: "sellerId is required" });
    }

    // Filter and pagination logic
    const skip = (page - 1) * limit;
    const filter = { "Items.sellerId": new mongoose.Types.ObjectId(sellerId) };
    const Address = require("../models/AddressModel");

    // Query the database
    const orders = await Order.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ orderDate: -1 })
      .populate("user", "_id username phone address email")
      .populate("Items.productId");

    const totalOrders = await Order.countDocuments(filter); // Total number of orders for this user
    const totalPages = Math.ceil(totalOrders / limit);

    // Response
    res.status(200).send({
      success: true,
      message: "Orders retrieved successfully",
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Error in getOrdersBySeller:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

const updateOrderByStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log(req.body);
    const newStatus = req.body.status;

    // Validate the provided status
    const validStatuses = ["Pending", "Accepted", "Cancelled", "Received Back"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).send({ message: "Invalid status provided." });
    }

    // Find the order by ID and check if the seller owns it
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).send({ message: "Order not found." });
    }

    if (
      order.Items.some(
        (item) => item.sellerId.toString() !== req.seller._id.toString()
      )
    ) {
      return res
        .status(403)
        .send({ message: "You are not the seller of this order." });
    }

    // Update the status of the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status: newStatus } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      updatedOrder,
    });
  } catch (error) {
    console.error("Error in updateOrderByStatus:", error);
    res.status(500).json({ message: "Error updating order status.", error });
  }
};

module.exports = {
  placeOrder,
  getOrdersByUser,
  getOrderDetails,
  updateOrderStatus,
  getOrdersBySeller,
  updateOrderByStatus,
};
