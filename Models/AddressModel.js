// AddressModel.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  address: String,
  building: String,
  pincode: String,
  city: String,
  phonenumber: String,
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
