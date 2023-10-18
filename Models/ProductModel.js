const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const productSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
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
    desciption:{
        type:String,
        required:true,
        minLenght:25
    },
    unitsSold:{
        type:Number,
        default:0
    }
})

module.exports=mongoose.model("Product",productSchema);