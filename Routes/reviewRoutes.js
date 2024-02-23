const express=require("express");
const { body, check } = require("express-validator");
const { deleteReview, getProductReview, addReview } = require("../Controllers/reviewController");
const router=express.Router();

router.route("/addreview")
    .post([
        body("description").exists(),
        body("productId").exists(),
        body("userId").exists(),
        body("other").optional(),
    ],addReview);

router.route("/deletereview/:reviewId")
    .delete([
        check("reviewId").exists().isMongoId()
    ],deleteReview);

router.route("/allproductreview/:productId")
    .get([
        check("productId").exists().isMongoId()
    ],getProductReview)

module.exports=router;