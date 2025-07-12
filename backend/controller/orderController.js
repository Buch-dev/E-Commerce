import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import HandleError from "../utils/handleError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

// Create New Order
export const createNewOrder = handleAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

// Getting Single Order
export const getSingleOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Getting My Orders
export const getMyOrders = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    "user",
    "name email"
  );

  if (!orders || orders.length === 0) {
    return next(new HandleError("No orders found for this user", 404));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

// Admin - Getting All Orders
export const getAllOrders = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name email");

  if (!orders || orders.length === 0) {
    return next(new HandleError("No orders found", 404));
  }

  res.status(200).json({
    success: true,
    orders,
    totalOrders: orders.length,
    totalAmount: orders.reduce((acc, order) => acc + order.totalPrice, 0),
  });
});

// Admin - Update Order Status
export const updateOrderStatus = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new HandleError("Order already delivered", 400));
  }

  await Promise.all(
    order.orderItems.map(async (item) => {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    })
  );

  order.orderStatus = req.body.status || order.orderStatus;
  if (order.orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
    order.deliveredBy = req.user.name; // Assuming the user updating the order is the one delivering
  }

  await order.save();
  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order,
  });
});

// Admin - Delete Order
export const deleteOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  if (order.orderStatus !== "Delivered") {
    return next(new HandleError("Only delivered orders can be deleted", 400));
  }

  await Order.deleteOne({ _id: req.params.id });
  await Promise.all(
    order.orderItems.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
            // Increment stock back if the order is deleted
            // This assumes that the stock was decremented when the order was created
        });
    })
  );
  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});
