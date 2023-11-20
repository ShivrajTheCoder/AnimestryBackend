const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const cartSchema=new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"User",
    },
    products:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Product"
        }
    ]
})

module.exports=mongoose.model("Cart",cartSchema);