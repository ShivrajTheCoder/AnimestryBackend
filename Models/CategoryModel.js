const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const categorySchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    discount:{
        type:Number,
    },
    image_url:{
        type:String,
        required:true
    }
})

module.exports=mongoose.model("Category",categorySchema);