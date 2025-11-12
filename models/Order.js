const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        { 
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, 
            quantity: { type: Number, default: 1 } 
        }
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "Pending" }, // Pending, Shipped, Completed
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
