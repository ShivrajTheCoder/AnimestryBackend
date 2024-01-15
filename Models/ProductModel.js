const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    anime: {
        type: String,
        required: true,
    },
    image_url: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Category",
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
        minlength: 25
    },
    unitsSold: {
        type: Number,
        default: 0
    },
    colorOptions: {
        type: [String],
        default: [],
    },
});

module.exports = mongoose.model("Product", productSchema);
