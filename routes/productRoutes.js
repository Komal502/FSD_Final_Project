const express = require("express");
const router = express.Router();
const Product = require("../models/Product");  // ✅ matches file name

// Home Page - Products
router.get("/", async (req, res) => {
  const search = req.query.search || "";
  const products = await Product.find({ name: { $regex: search, $options: "i" } });
  res.render("index", { products, user: req.session.user });
});

// Product Details
router.get("/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render("product", { product, user: req.session.user });
});

// Admin Page - View + Add Product
router.get("/admin", async (req, res) => {
  const products = await Product.find();
  res.render("admin", { products, user: req.session.user });
});

// Add Product
router.post("/admin", async (req, res) => {
  const { name, description, price, category, image } = req.body;
  await Product.create({ name, description, price, category, image });
  res.redirect("/admin");
});

// Delete Product
router.post("/admin/delete/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

module.exports = router;
