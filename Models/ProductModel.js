const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const productSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    anime:{
        type:String,
        required:true,
        required:true,
    },
    image_url:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.ObjectId,
        required:true,
        ref:"Category",
    },
    price:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
        minLenght:25
    },
    unitsSold:{
        type:Number,
        default:0
    }
})

//add color

module.exports=mongoose.model("Product",productSchema);