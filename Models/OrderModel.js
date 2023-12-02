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
const orderSchema = new Schema({
    products: [cartProductSchema],
    amount:{
        type:Number,
        required:true,
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    paymentStatus:{
        type:Boolean,
        requried:true,
        default:false,
    }
})

//add address,date, here

module.exports=mongoose.model("Order",orderSchema);