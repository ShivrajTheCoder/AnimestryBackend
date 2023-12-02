const express = require("express");
const router = express.Router();
const { body, check } = require("express-validator");
const {
    placeOrder,
    getAllOrders,
    cancelOrder,
    getAllUserOrders,
    paymentOrder
} = require("../Controllers/orderController");
const mongoose = require("mongoose");


router.post(
    '/placeorder',
    [
      body('userId').isMongoId(),
      body('products')
        .isArray()
        .custom((value) => {
          // Check if all items in the array have valid properties
          if (
            value.every(
              (item) =>
                mongoose.Types.ObjectId.isValid(item.productId) &&
                typeof item.quantity === 'number' &&
                item.quantity > 0
            )
          ) {
            return true;
          } else {
            throw new Error('Invalid data in products array');
          }
        }),
    ],
    placeOrder
  );

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

module.exports = router;
