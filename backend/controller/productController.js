import Product from "../models/productModel.js";
import HandleError from "../utils/handleError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";
import APIFunctionality from "../utils/apiFunctionality.js";

// http://localhost:8000/api/v1/product/68575ac0fc822c5be425a3f6?keyword=shirt

// Create a new product
export const createProduct = handleAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;
  console.log("Creating product with user ID:", req.user);

  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// Get all products
export const getAllProducts = handleAsyncError(async (req, res, next) => {
  const resultsPerPage = 3; // Number of products per page
  const apiFeatures = new APIFunctionality(Product.find(), req.query)
    .search()
    .filter();

  // Getting filtered query before pagination
  const filteredQuery = apiFeatures.query.clone();
  const productCount = await filteredQuery.countDocuments();

  // Calculate total pages based on filtered product count
  const totalPages = Math.ceil(productCount / resultsPerPage);
  const currentPage = Number(req.query.page) || 1;

  if (currentPage > totalPages && productCount > 0) {
    return next(new HandleError("Page not found", 404));
  }

  // Apply pagination to the query
  apiFeatures.pagination(resultsPerPage);
  // Execute the query to get products
  const products = await apiFeatures.query;

  if (!products || products.length === 0) {
    return next(new HandleError("No products found", 404));
  }
  res.status(200).json({
    success: true,
    products,
    productCount,
    resultsPerPage,
    totalPages,
    currentPage,
  });
});

// Update Product
export const updateProduct = handleAsyncError(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return next(new HandleError("Product not found", 404));
  }
  res.status(200).json({ success: true, product });
});

// Delete Product
export const deleteProduct = handleAsyncError(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new HandleError("Product not found", 404));
  }
  res
    .status(200)
    .json({ success: true, message: "Product deleted successfully" });
});

// Access a single product by ID
export const getSingleProduct = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new HandleError("Product not found", 404));
  }
  res.status(200).json({ success: true, product });
});

// 6️⃣Admin - Getting all Products
export const getAdminProducts = handleAsyncError(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    products,
    productCount: products.length,
  });
});
