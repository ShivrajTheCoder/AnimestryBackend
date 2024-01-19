const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartProductSchema = new Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
    },
    quantity: {
        type: Number,
        default: 1,
    },
    color: {
        type: String,
        maxLength:6,
        minLenght:6
    },
});

const orderSchema = new Schema({
    products: [cartProductSchema],
    amount: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    paymentStatus: {
        type: Boolean,
        required: true,
        default: false,
    },
    address: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Address",
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Order", orderSchema);
