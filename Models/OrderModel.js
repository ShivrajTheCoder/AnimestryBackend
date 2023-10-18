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
    }
})

module.exports=mongoose.model("Order",orderSchema);