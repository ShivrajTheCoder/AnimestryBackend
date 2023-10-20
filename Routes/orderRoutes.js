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

router.route("/placeorder", [
    body("userId").isMongoId(),
    body("products").isArray().custom(value => {
        // Check if all items in the array are valid MongoDB IDs
        if (value.every(item => mongoose.Types.ObjectId.isValid(item))) {
            return true;
        } else {
            throw new Error('Invalid MongoDB ID in products array');
        }
    })
], placeOrder);

router.route("/getallorders", getAllOrders);

router.route("/cancelorder/:orderId", [
    check("orderId").exists().isMongoId(),
], cancelOrder);

router.route("/alluserorders/:userId", [
    check("userId").exists().isMongoId(),
], getAllUserOrders);

router.route("/payment/:orderId", [
    check("orderId").exists().isMongoId(),
], paymentOrder);

module.exports = router;
