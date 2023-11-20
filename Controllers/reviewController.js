const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const User = require("../Models/UserModel");
const { NotFoundError } = require("../Utilities/CustomErrors");
const Product = require("../Models/ProductModel");
const Review = require("../Models/ReviewModel");
const { validationResult } = require("express-validator");
const exp=module.exports;

exp.addReview=RouterAsncErrorHandler(async(req,res,next)=>{
    const {userId,description,productId}=req.body;
    console.log(req.body,"request boyd");

    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try{
        const user=await User.findById(userId);
        const product=await Product.findById(productId);
        if(user && product){
            const newReview=new Review({
                userId,
                productId,
                description,
            })
            const rev=await newReview.save();
            return res.status(201).json({
                message:"Review Added",
                reveiw:rev
            })
        }
        else{
            throw new NotFoundError("User Or Product not found!");
        }
    }
    catch(err){
        next(err);
    }
})

exp.deleteReview=RouterAsncErrorHandler(async(req,res,next)=>{
    const {reviewId}=req.params;
    try{
        const review=await Review.findByIdAndDelete(reviewId);
        return res.status(200).json({
            message:"Reveiw Deleted",
            review    
        })
    }
    catch(error){
        next(error);
    }
})

exp.getProductReview=RouterAsncErrorHandler(async(req,res,next)=>{
    const {productId}=req.params;
    try{
        const product=await Product.findById(productId);
        if(product){
            const reviews= await Review.find({productId});
            if(reviews.length<1){
                throw new NotFoundError("No reveiws found!");
            }
            return res.status(200).json({
                message:"Reviews found",
                reviews
            })
        }
        else{
            throw new NotFoundError("Product not found!");
        }
    }
    catch(error){
        next(error);
    }
})
