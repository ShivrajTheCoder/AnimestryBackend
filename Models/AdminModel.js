const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const adminSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        minLength:5,
    },
    password:{
        type:String,
        required:true,
        minLength:6,
    }
})

module.exports=mongoose.model("Admin",adminSchema);