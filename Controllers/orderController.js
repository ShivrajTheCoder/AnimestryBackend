const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const Address = require("../Models/AddressModel");
const Order = require("../Models/OrderModel");
const Product = require("../Models/ProductModel"); // Import ProductModel
const User = require("../Models/UserModel");
const { CustomError, NotFoundError } = require("../Utilities/CustomErrors");
const { validationResult } = require("express-validator");

const exp = module.exports;

exp.placeOrder = RouterAsncErrorHandler(async (req, res, next) => {

  const { products, userId } = req.body;
  const savedAddress = req.savedAddress;
  try {
    // Check if all products are valid
    const productData = await Product.find({ _id: { $in: products.map(p => p.productId) } });
    if (productData.length !== products.length) {
      throw new CustomError(400, "Some products are invalid", "Invalid");
    }

    // Calculate total amount
    let totalAmount = 0;
    products.forEach(product => {
      const matchedProduct = productData.find(p => p._id.toString() === product.productId.toString());
      totalAmount += matchedProduct.price * product.quantity;
    });

    // Create a new order
    const newOrder = new Order({
      products,
      amount: totalAmount,
      userId,
      address:savedAddress._id
    });

    const ord = await newOrder.save();

    return res.status(201).json({
      message: "Order Placed",
      order: ord,
      userId,
      savedAddress
    });
  } catch (error) {
    next(error);
  }
});

exp.getAllOrders = RouterAsncErrorHandler(async (req, res, next) => {
  try {
    const orders = await Order.find();
    if (orders.length > 0) {
      return res.status(200).json({
        message: "Orders found",
        orders,
      });
    } else {
      throw new NotFoundError();
    }
  } catch (error) {
    next(error);
  }
});

exp.getAllUserOrders = RouterAsncErrorHandler(async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User Not Found");
    }

    const userOrders = await Order.find({ userId });
    if (userOrders.length < 1) {
      throw new NotFoundError("No Order Found");
    }
    return res.status(200).json({
      message: "Orders Found",
      userOrders,
    });
  } catch (error) {
    next(error);
  }
});

exp.cancelOrder = RouterAsncErrorHandler(async (req, res, next) => {
  const { orderId } = req.body;
  try {
    const canceled = await Order.findByIdAndDelete(orderId);
    return res.status(200).json({
      message: "Order canceled",
      order: canceled,
    });
  } catch (error) {
    next(error);
  }
});

exp.paymentOrder = RouterAsncErrorHandler(async (req, res, next) => {
  const { orderId } = req.body;
  // Integrate razorpay here
  try {
    const payedOr = await Order.findByIdAndUpdate(orderId, { paymentStatus: true });
    return res.status(200).json({
      message: "Payment successful",
      order: payedOr,
    });
  } catch (error) {
    next(error);
  }
});

exp.saveAddress = RouterAsncErrorHandler(async (req, res, next) => {
  const { userId, firstname, lastname, address, building, pincode, city, phonenumber } = req.body;

  try {
    // Create a new address
    const newAddress = new Address({
      firstname,
      lastname,
      address,
      building,
      pincode,
      city,
      phonenumber,
    });

    // Save the address to the database
    const savedAddress = await newAddress.save();

    // Attach the saved address to the request object
    req.savedAddress = savedAddress;

    // Update the user's address array with the new address ID
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { address: savedAddress._id } },
      { new: true }
    );

    // Call next to pass control to the next middleware (placeOrder)
    next();
  } catch (error) {
    next(error);
  }
});
