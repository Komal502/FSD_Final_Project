// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// 🛒 ADD ITEM TO CART
router.post("/add", async (req, res) => {
  try {
    if (!req.session.user) {
      console.log("⚠️ No session found. Redirecting to login.");
      return res.redirect("/login");
    }

    const userId = req.session.user._id;
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    console.log("🧠 Add-to-Cart Debug:");
    console.log("User ID:", userId);
    console.log("Product ID:", productId);
    console.log("Quantity:", qty);

    const product = await Product.findById(productId);
    if (!product) {
      console.log("❌ Product not found!");
      return res.status(404).send("Product not found");
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      console.log("🆕 Creating new cart for user");
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    // Populate product info before calculating totalPrice
    await cart.populate("items.product");

    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );

    await cart.save();
    console.log("✅ Cart saved successfully:", cart);

    res.redirect("/cart");
  } catch (err) {
    console.error("❌ Error adding to cart:", err);
    res.status(500).send("Error adding to cart");
  }
});

// 🧾 VIEW CART
router.get("/", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");
    const userId = req.session.user._id;

    let cart = await Cart.findOne({ user: userId }).populate("items.product").lean();

    console.log("🧺 Cart loaded:", cart);

    if (!cart) {
      // If no cart exists, send empty cart structure
      cart = { items: [], totalPrice: 0 };
    }

    res.render("cart", { cart });
  } catch (err) {
    console.error("❌ Error loading cart:", err);
    res.status(500).send("Error loading cart");
  }
});

// ❌ REMOVE ITEM FROM CART
router.post("/remove", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");
    const userId = req.session.user._id;
    const { productId } = req.body;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return res.redirect("/cart");

    // Remove the selected product
    cart.items = cart.items.filter(
      (item) => item.product._id.toString() !== productId
    );

    if (cart.items.length === 0) {
      await Cart.deleteOne({ user: userId });
      console.log("🗑️ Cart is empty. Deleted cart for user:", userId);
    } else {
      cart.totalPrice = cart.items.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      );
      await cart.save();
      console.log("✅ Updated cart after removal:", cart);
    }

    res.redirect("/cart");
  } catch (err) {
    console.error("❌ Error removing item:", err);
    res.status(500).send("Error removing item");
  }
});

// 💳 CHECKOUT → CREATE ORDER + CLEAR CART
router.post("/checkout", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");
    const userId = req.session.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) return res.redirect("/cart");

    // Create new order
    const order = new Order({
      userId,
      products: cart.items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      })),
      totalPrice: cart.totalPrice,
      orderDate: new Date(),
      status: "Pending",
    });

    await order.save();
    await Cart.deleteOne({ user: userId });

    console.log(`🧾 Order placed for user ${userId}`);
    res.redirect("/orders");
  } catch (err) {
    console.error("❌ Error during checkout:", err);
    res.status(500).send("Error during checkout");
  }
});

module.exports = router;
