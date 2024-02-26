const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cartProductSchema=require("./cartProductSchema");


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
    deliverStatus: {
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
    paymentStatus:{
        type:Boolean,
        default:false,
    },
    rzId:{
        type:String,
    },
    code:{
        type:mongoose.Types.ObjectId,
        ref:"Code",
    }
});

module.exports = mongoose.model("Order", orderSchema);
