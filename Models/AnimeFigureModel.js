const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const animeFigureSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    anime:{
        type:String,
        required:true,
    },
    image_url:{
        type:String,
        required:true,
    },
    other_images:{
        type:[String],
        default:[]
    },
    description:{
        type:String,
        required:true,
        minLength:25
    },
    active:{
        type:Boolean,
        default:true
    },
    unitsSold:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:true,
        default:0
    }
})

module.exports=mongoose.model("Anime",animeFigureSchema);