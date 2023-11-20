const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CartModel = require("../Models/CartModel");
const ProductModel = require("../Models/ProductModel");
const UserModel = require("../Models/UserModel");
const { NotFoundError } = require("../Utilities/CustomErrors");

const exp = module.exports;

exp.addToCart = RouterAsncErrorHandler(async (req, res, next) => {
    const { productId, userId } = req.body;
    try {
        const product = await ProductModel.findById(productId);
        const user = await UserModel.findById(userId);
        if (!product || !user) {
            throw new NotFoundError("Product or User not found!");
        }
        const cart = await CartModel.findOneAndUpdate({ userId },
            { $push: { products: productId } },
            { new: true })
        return res.status(200).json({
            message: "Product added to cart",
            cart
        })
    }
    catch (error) {
        next(error);
    }
});

exp.removeFromCart = RouterAsncErrorHandler(async (req, res, next) => {
    const { productId, userId } = req.body;
    try {
        const product = await ProductModel.findById(productId);
        const user = await UserModel.findById(userId);
        if (!product || !user) {
            throw new NotFoundError("Product or User not found!");
        }
        const updatedCart = await CartModel.findOneAndUpdate(
            { userId },
            { $pull: { products: productId } },
            { new: true } // Return the updated document
        );

        if (!updatedCart) {
            throw new NotFoundError("User not found or product not in the cart");
        }

        res.status(200).json({
            message: "Product removed from cart successfully",
            cart: updatedCart
        });
    }
    catch (error) {
        next(error);
    }
});
exp.getUserCart = RouterAsncErrorHandler(async (req, res, next) => {
    const {userId}=req.params;
    try {
        const user=await UserModel.findById(userId);
        if(!user){
            throw new NotFoundError("User not found!");
        }
        const cart=await CartModel.find({userId});
        if(cart.length<0){
            throw new NotFoundError("No item in cart!");
        }
        return res.status(200).json({
            message:"items found!",
            cart
        })
    }
    catch (error) {
        next(error);
    }
});