const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ==============================
// 🧾 Register Page
// ==============================
router.get("/register", (req, res) => {
  res.render("register");
});

// ==============================
// 🧩 Handle User Registration
// ==============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("User already registered with this email");
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.redirect("/login");
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).send("Error during registration");
  }
});

// ==============================
// 🔑 Login Page
// ==============================
router.get("/login", (req, res) => {
  res.render("login");
});

// ==============================
// 🔐 Handle User Login
// ==============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      // ✅ Store correct key name (_id)
req.session.user = { _id: user._id, name: user.name, isAdmin: user.isAdmin };
      res.redirect("/");
    } else {
      res.send("Invalid email or password");
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).send("Error during login");
  }
});

// ==============================
// 🚪 Logout
// ==============================
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
