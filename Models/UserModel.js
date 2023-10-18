const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const userSchema=new Schema({
    name:{
        type:String,
        requried:true,
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
        minLenght:6,
    }
})

module.exports=mongoose.model("User",userSchema);