const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const subCategorySchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    discount:{
        type:Number
    }
})

const categorySchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    discount:{
        type:Number,
    },
    subcategories:[subCategorySchema]
})

module.exports=mongoose.model("Category",categorySchema);