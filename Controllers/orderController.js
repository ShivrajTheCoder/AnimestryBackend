const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CartModel = require("../Models/CartModel");
const Order = require("../Models/OrderModel");
const Product = require("../Models/ProductModel"); 
const OtherProduct=require("../Models/OtherProducts");
const User = require("../Models/UserModel");
const { CustomError, NotFoundError } = require("../Utilities/CustomErrors");
const { validationResult } = require("express-validator");
const Razorpay = require("razorpay");
const OrderModel = require("../Models/OrderModel");
const exp = module.exports;

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RZORPAY_SECRET,
});

exp.createRzOrder = RouterAsncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { products, userId, address } = req.body;
  const savedAddress = address;
  console.log(req.body);
  try {
    // Separate products by model type
    const productIds = products.map(p => p.productId);
    const productData = await Product.find({ _id: { $in: productIds } });
    const otherProductData = await OtherProduct.find({ _id: { $in: productIds } });

    // Check if all products are valid
    if (productData.length + otherProductData.length !== products.length) {
      throw new CustomError(400, "Some products are invalid", "Invalid");
    }

    // Calculate total amount
    let totalAmount = 0;
    const tax = 0.1;
    products.forEach(product => {
      const matchedProduct = productData.find(p => p._id.toString() === product.productId.toString());
      if (matchedProduct) {
        totalAmount += matchedProduct.price * product.quantity;
      } else {
        const matchedOtherProduct = otherProductData.find(p => p._id.toString() === product.productId.toString());
        totalAmount += matchedOtherProduct.price * product.quantity;
      }
    });

    const options = {
      amount: (totalAmount * (1 + tax)) * 100,
      currency: "INR"
    };

    // Create a new order with Razorpay
    let rz_orderId = "";
    try {
      const order = await new Promise((resolve, reject) => {
        instance.orders.create(options, function (err, order) {
          if (err) {
            reject(new Error("Something went wrong with Razorpay!"));
          } else {
            resolve(order);
          }
        });
      });
      rz_orderId = order.id;
    } catch (err) {
      throw new CustomError(500, err.message, "Razorpay Error");
    }

    // Save the order
    const newOrder = new Order({
      products,
      amount: totalAmount,
      userId,
      address: savedAddress,
      rzId: rz_orderId
    });
    const savedOrder = await newOrder.save();

    return res.status(201).json({
      message: "Razorpay order created",
      order: savedOrder
    });
  } catch (error) {
    next(error);
  }
});


exp.markAsPayed=RouterAsncErrorHandler(async(req,res,next)=>{
  const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
  const {orderId,userId,rzId}=req.body;
  // console.log(req.body);
  try{
    const payed=await OrderModel.findOneAndUpdate({_id:orderId,userId,rzId},{paymentStatus:true},{
      new:true
    });
    if(!payed){
      throw new NotFoundError("Order not found!");
    }
    await CartModel.findOneAndRemove({userId});
    return res.status(200).json({
      message:"Payed",
      order:payed
    })
  }
  catch(error){
    next(error);
  }
})
exp.getAllOrders = RouterAsncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
  try {
    const orders = await Order.find({paymentStatus:true});
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
  const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User Not Found");
    }

    const userOrders = await Order.find({ userId ,paymentStatus:true});
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
  const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
  const { orderId } = req.body;
  try {
    // const canceled = await Order.findByIdAndDelete(orderId);
    const canceled = await Order.findByIdAndDelete(orderId);
    return res.status(200).json({
      message: "Order canceled",
      order: canceled,
    });
  } catch (error) {
    next(error);
  }
});