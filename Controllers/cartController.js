const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const AnimeFigureModel = require("../Models/AnimeFigureModel");
const CartModel = require("../Models/CartModel");
const ProductModel = require("../Models/ProductModel");
const UserModel = require("../Models/UserModel");
const { NotFoundError } = require("../Utilities/CustomErrors");

const exp = module.exports;

exp.addToCart = RouterAsncErrorHandler(async (req, res, next) => {
    const { productId, userId, quantity, color, size, figure = false } = req.body;
    try {
        let product;
        if (figure) {
            // If the product is a figure, use the FigureModel
            product = await AnimeFigureModel.findById(productId);
        } else {
            // Otherwise, use the ProductModel
            product = await ProductModel.findById(productId);
        }

        const user = await UserModel.findById(userId);

        if (!product || !user) {
            throw new NotFoundError("Product or User not found!");
        }

        let cart = await CartModel.findOne({ userId });

        if (!cart) {
            // If the cart doesn't exist, create a new one
            cart = new CartModel({
                userId: userId,
                products: [{ productId, quantity: quantity || 1, color, size }],
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
                cart.products.push({ productId, quantity: quantity || 1, color, size,figure });
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
    const { productId, figure = false } = req.params;
    const userId = '653245d8549b3c8dd758a6ee';
    try {
        let productModel;
        if (figure) {
            // If figure is true, use FigureModel to find the product
            productModel = AnimeFigureModel;
        } else {
            // Otherwise, use ProductModel
            productModel = ProductModel;
        }

        const product = await productModel.findById(productId);
        const user = await UserModel.findById(userId);

        if (!product || !user) {
            throw new NotFoundError("Product or User not found!");
        }

        const updatedCart = await CartModel.findOne({ userId });

        if (!updatedCart) {
            throw new NotFoundError("User not found or product not in the cart");
        }

        const lastProductIndex = updatedCart.products.findIndex(p => p.productId.equals(productId));

        if (lastProductIndex !== -1) {
            // Decrease the quantity of the last product
            if (updatedCart.products[lastProductIndex].quantity > 1) {
                updatedCart.products[lastProductIndex].quantity -= 1;
            } else {
                // If the quantity is 1, remove the product from the array
                updatedCart.products.splice(lastProductIndex, 1);
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
                productDetails = await AnimeFigureModel.findById(cartProduct.productId);
            }

            if (!productDetails) {
                throw new NotFoundError(`Product with ID ${cartProduct.productId} not found in any model!`);
            }

            return {
                productId: cartProduct.productId,
                quantity: cartProduct.quantity,
                color: cartProduct.color,
                size: cartProduct.size,
                name: productDetails.name,
                price: productDetails.price,
                description: productDetails.description,
                anime: productDetails.anime,
                category: productDetails.category,
                image_url: productDetails.image_url
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
