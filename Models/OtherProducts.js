const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const otherProductsSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    category: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Category",
    },
    anime:{
        type:String,
        required:true,
    },
    image_url:{
        type:String,
        required:true,
    },
    other_images:[
        {
            type:"String"
        }
    ],
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
    },
    discount: {
        type: Number,
        default: 0,
        validate: {
            validator: function(value) {
                return value >= 0 && value <= 75;
            },
            message: props => `${props.value} is not a valid discount. Discount must be between 0 and 75.`
        }
    }
})

module.exports=mongoose.model("OtherProducts",otherProductsSchema);