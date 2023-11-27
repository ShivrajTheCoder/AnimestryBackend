const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartProductSchema = new Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
    },
    quantity: {
        type: Number,
        default: 1, // You can set a default quantity if not provided
    },
});

const cartSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
    },
    products: [cartProductSchema],
});

module.exports = mongoose.model("Cart", cartSchema);
