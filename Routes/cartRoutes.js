const express=require("express");
const { body, check } = require("express-validator");
const { addToCart, removeFromCart, getUserCart } = require("../Controllers/cartController");
const router=express.Router();

router.route("/addtocart")
    .post([
        body("userId").exists().isMongoId(),
        body("productId").exists().isMongoId(),
    ],addToCart);

router.route("/removefromcart")
    .delete([
        body("userId").exists().isMongoId(),
        body("productId").exists().isMongoId(),
    ],removeFromCart);

router.route("/getusercart/:userId")
    .get([
        check("userId").exists().isMongoId(),
    ],getUserCart)

module.exports=router;