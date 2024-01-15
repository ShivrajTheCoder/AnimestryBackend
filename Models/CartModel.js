const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartProductSchema = new Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Product",
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    color: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL'],
        required: true,
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
