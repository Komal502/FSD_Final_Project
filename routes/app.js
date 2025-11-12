const express = require('express');
const app = express();
const Order = require('./models/order'); // Your Mongoose Order model
const Product = require('./models/product'); // Your Product model
const User = require('./models/user'); // If needed

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Orders page
app.get('/orders', isLoggedIn, async (req, res) => {
  try {
    // Get all orders of the logged-in user
    const orders = await Order.find({ userId: req.session.userId })
      .populate('products.productId') // populate product info
      .sort({ createdAt: -1 }); // latest orders first

    res.render('orders', { orders, user: req.session.user });
  } catch (err) {
    console.log(err);
    res.send('Something went wrong');
  }
});
