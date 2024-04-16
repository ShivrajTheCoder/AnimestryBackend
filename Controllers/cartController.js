const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const OtherProducts= require("../Models/OtherProducts");
const CartModel = require("../Models/CartModel");
const ProductModel = require("../Models/ProductModel");
const UserModel = require("../Models/UserModel");
const { NotFoundError } = require("../Utilities/CustomErrors");
const { validationResult } = require("express-validator");

const exp = module.exports;

exp.addToCart = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    // console.log("i ram")
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { productId, userId, quantity, color, size, other = false } = req.body;
    // console.log(req.body);
    try {
        let product;
        if (other) {
            // If the product is a other, use the FigureModel
            product = await OtherProducts.findById(productId);
        } else {
            // Otherwise, use the ProductModel
            product = await ProductModel.findById(productId);
        }

        const user = await UserModel.findById(userId);
        // console.log(user,product);
        if (!product || !user) {
            throw new NotFoundError("Product or User not found!");
        }

        let cart = await CartModel.findOne({ userId });

        if (!cart) {
            // If the cart doesn't exist, create a new one
            cart = new CartModel({
                userId: userId,
                products: [{ productId, quantity: quantity || 1, color, size,other }],
            });

        } else {
            // If the cart exists, check if the product is already in the cart
            const existingProductIndex = cart.products.findIndex(p => p.productId && p.productId.equals(productId));

            if (existingProductIndex !== -1) {
                // If the product is already in the cart, update its quantity
                if (cart.products[existingProductIndex].quantity !== undefined) {
                    cart.products[existingProductIndex].quantity += quantity || 1;
                } else {
                    cart.products[existingProductIndex].quantity = quantity || 1;
                }
            } else {
                // If the product is not in the cart, add it
                cart.products.push({ productId, quantity: quantity || 1, color, size,other });
            }
        }

        await cart.save();

        return res.status(200).json({
            message: "Product added to cart",
            cart
        });
    } catch (error) {
        console.error('Error:', error);
        next(error);
    }
});



exp.removeFromCart = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const {other,complete,productId,userId}=req.body;
    console.log(req.body,req.params);
    // const userId = '65c114022931680e9a1531ed';
    // console.log(productId,other)
    try {
        let product=null;
        if (other) {
            // If other is true, use FigureModel to find the product
            product =await OtherProducts.findById(productId);
        } else {
            // Otherwise, use ProductModel
            product =await ProductModel.findById(productId);
        }

        
        const user = await UserModel.findById(userId);
        // console.log(product,user,"here it is")
        if (!product || !user) {
            throw new NotFoundError("Product or User not found!");
        }

        const updatedCart = await CartModel.findOne({ userId });

        if (!updatedCart) {
            throw new NotFoundError("User not found or product not in the cart");
        }

        const productIndex = updatedCart.products.findIndex(p => p.productId.equals(productId));

        if (productIndex !== -1) {
            if (complete) {
                // If complete is true, remove the product completely from the cart
                updatedCart.products.splice(productIndex, 1);
            } else {
                // If complete is false, decrease the quantity of the product
                if (updatedCart.products[productIndex].quantity > 1) {
                    updatedCart.products[productIndex].quantity -= 1;
                } else {
                    // If the quantity is 1, remove the product from the array
                    updatedCart.products.splice(productIndex, 1);
                }
            }

            // Save the updated cart
            await updatedCart.save();

            res.status(200).json({
                message: "Product removed from cart successfully",
                cart: updatedCart,
            });
        } else {
            res.status(404).json({
                message: "Product not found in the cart",
            });
        }
    } catch (error) {
        next(error);
    }
});



// getUserCart
exp.getUserCart = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { userId } = req.params;
    
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found!");
        }

        const cart = await CartModel.findOne({ userId });
        if (!cart || cart.products.length === 0) {
            throw new NotFoundError("No items in cart!");
        }

        // Retrieve additional product details using the product IDs in the cart
        const populatedProducts = await Promise.all(cart.products.map(async (cartProduct) => {
            let productDetails;

            // Check if the product exists in ProductModel
            productDetails = await ProductModel.findById(cartProduct.productId);
            
            // If not found in ProductModel, check in FigureModel
            if (!productDetails) {
                productDetails = await OtherProducts.findById(cartProduct.productId);
            }

            if (!productDetails) {
                throw new NotFoundError(`Product with ID ${cartProduct.productId} not found in any model!`);
            }

            return {
                productId: cartProduct.productId,
                quantity: cartProduct.quantity,
                color: cartProduct.color,
                other:cartProduct.other,
                size: cartProduct.size,
                name: productDetails.name,
                price: productDetails.price,
                description: productDetails.description,
                anime: productDetails.anime,
                category: productDetails.category,
                image_url: productDetails.image_url,
                discount:productDetails.discount,
            };
        }));

        return res.status(200).json({
            message: "Items found in the cart!",
            cart: { products: populatedProducts },
        });
    } catch (error) {
        next(error);
    }
});
