// AddressModel.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Types.ObjectId,
    required:true,
    ref:"User"
  },
  firstname:{
    type:String,
    required:true,
  },
  lastname: {
    type:String,
    required:true,
  },
  address: {
    type:String,
    required:true,
    minLenght:10
  },
  building: {
    type:String,
    required:true,
  },
  pincode: {
    type:Number,
    minLength:6,
    maxLength:6,
    required:true,
  },
  city: {
    type:String,
    required:true,
  },
  phonenumber: {
    type:Number,
    minLength:10,
    maxLength:10,
    required:true,
  },
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
