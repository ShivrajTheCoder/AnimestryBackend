const express = require("express");
const { body, check } = require("express-validator");
const { addToCart, removeFromCart, getUserCart } = require("../Controllers/cartController");
const router = express.Router();

router.route("/addtocart").post([
    body("userId").exists().isMongoId(),
    body("productId").exists().isMongoId(),
    body("color").exists().isString(),
    body("size").exists().isIn(['XS', 'S', 'M', 'L', 'XL']),
    body("quantity").exists().isInt({ min: 1 }), // Add quantity validation
    body("figure").optional().isBoolean()
], addToCart);

router.route("/removefromcart/:productId").delete([
    check("productId").exists().isMongoId(),
    body("figure").optional().isBoolean(),
], removeFromCart);

router.route("/getusercart/:userId").get([
    check("userId").exists().isMongoId(),
], getUserCart);

module.exports = router;
