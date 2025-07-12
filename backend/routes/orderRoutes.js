import express from "express";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
import {
  createNewOrder,
  deleteOrder,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  updateOrderStatus,
} from "../controller/orderController.js";
const router = express.Router();

router.route("/new/order").post(verifyUserAuth, createNewOrder);
router
  .route("/admin/order/:id")
  .get(verifyUserAuth, roleBasedAccess("admin"), getSingleOrder);
router.route("/order/user").get(verifyUserAuth, getMyOrders);
router
  .route("/admin/orders")
  .get(verifyUserAuth, roleBasedAccess("admin"), getAllOrders);
router
  .route("/admin/order/:id")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateOrderStatus);

// Admin - Delete Order
router
  .route("/admin/order/:id")
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteOrder);

export default router;
