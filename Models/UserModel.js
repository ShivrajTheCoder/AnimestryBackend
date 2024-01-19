const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const userSchema=new Schema({
    username:{
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
    },
    points:{
        type:Number,
        required:true,
        default:0,
    },
    address:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Address"
        }
    ]
})

module.exports=mongoose.model("User",userSchema);