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
    active:{
        type:Boolean,
        default:true,
    },
    discount: {
        type: Number,
        default: 0,
        validate: {
            validator: function(value) {
                return value >= 0 && value <= 75;
            },
            message: props => `${props.value} is not a valid discount. Discount must be between 0 and 75.`
        }
    }
});


module.exports = mongoose.model("Product", productSchema);
