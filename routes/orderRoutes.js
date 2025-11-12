const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// 🛍️ CHECKOUT → Create Order from MongoDB Cart
router.post("/order", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const userId = req.session.user._id;

    // Fetch user's cart with product details
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      console.log("⚠️ Checkout attempted with empty cart.");
      return res.redirect("/cart");
    }

    // Create order from cart data
    const orderProducts = cart.items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    }));

    const order = new Order({
      userId,
      products: orderProducts,
      totalPrice: cart.totalPrice,
      orderDate: new Date(),
      status: "Pending",
    });

    await order.save();
    await Cart.deleteOne({ user: userId }); // Clear cart after order

    console.log(`✅ Order placed successfully for user ${userId}`);
    res.redirect("/orders");
  } catch (err) {
    console.error("❌ Error placing order:", err);
    res.status(500).send("Error placing order");
  }
});

// 📜 VIEW ORDER HISTORY
router.get("/orders", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");
    const userId = req.session.user._id;

    const orders = await Order.find({ userId })
      .populate({
        path: "products.productId",
        model: "Product",
        select: "name price image",
      })
      .lean();

    res.render("orders", { orders });
  } catch (err) {
    console.error("❌ Error loading orders:", err);
    res.status(500).send("Error loading orders");
  }
});

module.exports = router;
