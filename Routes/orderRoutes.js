const express = require("express");
const router = express.Router();
const { body, check } = require("express-validator");
const {
  getAllOrders,
  cancelOrder,
  getAllUserOrders,
  createRzOrder,
  markAsPayed
} = require("../Controllers/orderController");
const mongoose = require("mongoose");

const cartProductSchema = require('../Models/cartProductSchema');
const authenticateToken = require("../Middlewares/UserAuthMiddleware");
const adminAuthenticateToken = require("../Middlewares/AdminAuthMiddleware");


router.get("/getallorders", adminAuthenticateToken, getAllOrders);

router.delete("/cancelorder/:orderId", authenticateToken, [
  check("orderId").exists().isMongoId(),
], cancelOrder);

router.get("/alluserorders/:userId", authenticateToken, [
  check("userId").exists().isMongoId(),
], getAllUserOrders);

// router.post("/payment/:orderId", [
//   check("orderId").exists().isMongoId(),
// ], paymentOrder);

router.post(
  '/createorder',
  authenticateToken,
  [
    body('address').exists().isMongoId(),
    body('userId').exists().isMongoId(),
    body("codeId").optional(),
    body('products')
      .isArray()
      .custom((value) => {
        if (
          value.every(
            (item) =>
              mongoose.Types.ObjectId.isValid(item.productId) &&
              typeof item.quantity === 'number' &&
              item.quantity > 0 &&
              typeof item.color === 'string' &&
              item.color.length <= 6 &&
              cartProductSchema.path('size').enumValues.includes(item.size) // Check if size is valid
          )
        ) {
          return true;
        } else {
          throw new Error('Invalid data in products array');
        }
      }),
  ],
  createRzOrder
);

router.post("/paymentsuccess",
  authenticateToken,
  [body("rzId").exists(),
  body("userId").exists().isMongoId(),
  body("orderId").exists().isMongoId(),
  ],
  markAsPayed
)



module.exports = router;
