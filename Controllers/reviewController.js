const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const User = require("../Models/UserModel");
const { NotFoundError } = require("../Utilities/CustomErrors");
const Product = require("../Models/ProductModel");
const OtherProduct=require("../Models/OtherProducts");
const Review = require("../Models/ReviewModel");
const { validationResult } = require("express-validator");
const exp = module.exports;

exp.addReview = RouterAsncErrorHandler(async (req, res, next) => {
    const { userId, description, productId, other } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        let product;
        if (other) {
            product = await OtherProduct.findById(productId);
        } else {
            product = await Product.findById(productId);
        }

        const user = await User.findById(userId);

        if (user && product) {
            const newReview = new Review({
                userId,
                productId,
                description,
            });
            const rev = await newReview.save();
            return res.status(201).json({
                message: "Review Added",
                review: rev
            });
        } else {
            throw new NotFoundError("User or Product not found!");
        }
    } catch (err) {
        next(err);
    }
});


exp.deleteReview = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { reviewId } = req.params;
    try {
        const review = await Review.findByIdAndDelete(reviewId);
        return res.status(200).json({
            message: "Reveiw Deleted",
            review
        })
    }
    catch (error) {
        next(error);
    }
})

exp.getProductReview = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { productId } = req.params;
    try {
        let product;
        // Check if the product exists in the Product model
        product = await Product.findById(productId);
        if (!product) {
            // If not found, check if it exists in the OtherProduct model
            product = await OtherProduct.findById(productId);
        }
        if (!product) {
            // If product not found in either model, throw error
            throw new NotFoundError("Product not found!");
        }

        // Find reviews for the product
        const reviews = await Review.find({ productId });

        if (reviews.length < 1) {
            throw new NotFoundError("No reviews found!");
        }

        return res.status(200).json({
            message: "Reviews found",
            reviews
        });
    } catch (error) {
        next(error);
    }
});

