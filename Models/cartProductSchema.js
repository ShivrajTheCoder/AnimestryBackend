const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const cartProductSchema = new Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    color: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL'],
        required: true,
    },
    figure:{
        type:Boolean,
        default:false,
        required:true
    }
});

module.exports=cartProductSchema;