const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const reviewSchema=new Schema({
    description:{
        type:String,
        required:true,
    },
    images:{
        type:String,
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    productId:{
        type:mongoose.Schema.ObjectId,
        ref:"Product",
        required:true,
    }
})

module.exports=mongoose.model("Review",reviewSchema);