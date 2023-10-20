const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [
        { type: mongoose.Schema.ObjectId,
        ref:"Prouduct" }
    ],
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

//add address here

module.exports=mongoose.model("Order",orderSchema);