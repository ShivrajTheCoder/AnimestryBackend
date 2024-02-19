const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cartProductSchema=require("./cartProductSchema");

const cartSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
    },
    products: [cartProductSchema],
});

module.exports = mongoose.model("Cart", cartSchema);
