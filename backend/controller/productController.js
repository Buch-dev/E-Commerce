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

// 6️⃣ Creating and Updating Review
export const createReviewForProduct = handleAsyncError(
  async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    if (!rating || !comment || !productId) {
      return next(new HandleError("All fields are required", 400));
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    const reviewExists = product.reviews.find(
      (rev) => rev.user.toString() === req.user.id.toString()
    );

    if (reviewExists) {
      product.reviews = product.reviews.map((rev) =>
        rev.user.toString() === req.user.id.toString()
          ? { ...rev, rating, comment }
          : rev
      );
    } else {
      product.reviews.push(review);
    }

    product.numOfReviews = product.reviews.length;
    let sum = 0;
    product.reviews.forEach((rev) => {
      sum += rev.rating;
    });
    product.ratings = sum / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      product,
    });
  }
);

// 7️⃣Getting Reviews
export const getProductReviews = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// 8️⃣ Deleting Reviews
export const deleteReview = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let sum = 0;
  reviews.forEach((rev) => {
    sum += rev.rating;
  });

  const ratings = reviews.length > 0 ? sum / reviews.length : 0;
  const numOfReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

// 9️⃣Admin - Getting all Products
export const getAdminProducts = handleAsyncError(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    products,
    productCount: products.length,
  });
});
