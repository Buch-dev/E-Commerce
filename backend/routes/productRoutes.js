import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} from "../controller/productController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
const router = express.Router();

// Routes
router
  .route("/products")
  .get(verifyUserAuth, getAllProducts)
  .post(verifyUserAuth, roleBasedAccess("admin"), createProduct);
router
  .route("/product/:id")
  .put(verifyUserAuth, updateProduct)
  .delete(verifyUserAuth, deleteProduct)
  .get(verifyUserAuth, getSingleProduct);

export default router;
