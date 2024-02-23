const express = require("express");
const { body, check } = require("express-validator");
const { addToCart, removeFromCart, getUserCart } = require("../Controllers/cartController");
const router = express.Router();

router.route("/addtocart").post([
    body("userId").exists().isMongoId(),
    body("productId").exists().isMongoId(),
    body("color").optional().isString(),
    body("size").optional().isIn(['XS', 'S', 'M', 'L', 'XL']),
    body("quantity").optional().isInt({ min: 1 }), // Add quantity validation
    body("other").optional().isBoolean()
], addToCart);

router.route("/removefromcart/:productId").post([
    check("productId").exists().isMongoId(),
    body("other").optional().isBoolean(),
    body("complete").optional().isBoolean(),
], removeFromCart);

router.route("/getusercart/:userId").get([
    check("userId").exists().isMongoId(),
], getUserCart);

module.exports = router;
