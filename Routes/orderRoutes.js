const express = require("express");
const router = express.Router();
const { body, check } = require("express-validator");
const {
  placeOrder,
  getAllOrders,
  cancelOrder,
  getAllUserOrders,
  paymentOrder,
  saveAddress
} = require("../Controllers/orderController");
const mongoose = require("mongoose");




router.get("/getallorders", getAllOrders);

router.delete("/cancelorder/:orderId", [
  check("orderId").exists().isMongoId(),
], cancelOrder);

router.get("/alluserorders/:userId", [
  check("userId").exists().isMongoId(),
], getAllUserOrders);

router.post("/payment/:orderId", [
  check("orderId").exists().isMongoId(),
], paymentOrder);

router.post(
  "/placeorder",
  [
    check("userId").exists().isMongoId(),
    body('firstname').notEmpty().isString(),
    body('lastname').notEmpty().isString(),
    body('address').notEmpty().isString(),
    body('building').notEmpty().isString(),
    body('pincode').notEmpty().isString(),
    body('city').notEmpty().isString(),
    body('phonenumber').notEmpty().isString(),
    body('products')
      .isArray()
      .custom((value) => {
        if (
          value.every(
            (item) =>
              mongoose.Types.ObjectId.isValid(item.productId) &&
              typeof item.quantity === 'number' &&
              item.quantity > 0 &&
              typeof item.color === 'string' && item.color.length <= 6 // Added validation for color length
          )
        ) {
          return true;
        } else {
          throw new Error('Invalid data in products array');
        }
      }),
  ],
  saveAddress,
  placeOrder
);



module.exports = router;
