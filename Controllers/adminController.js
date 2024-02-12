const { validationResult } = require("express-validator");
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CategoryModel = require("../Models/CategoryModel");
const OrderModel = require("../Models/OrderModel");
const Order=require("../Models/OrderModel");
const Products=require("../Models/ProductModel");
const Users=require("../Models/UserModel");
const { NotFoundError } = require("../Utilities/CustomErrors");
const exp=module.exports;

exp.Dashboardinfo=RouterAsncErrorHandler(async(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const orders=await Order.find({});
        const products=await Products.find({});
        const users=await Users.find({});
        const categories=await CategoryModel.find({});
        if(!orders || !products || !users){
            throw new NotFoundError("Order Products or users not found!");
        }
        return res.status(200).json({
            orders:orders.length,
            products:products.length,
            users:users.length,
            categories:categories.length
        })
    } catch (error) {
        next(error);
    }
})

exp.MarkAsDeliverd=RouterAsncErrorHandler(async(req,res,next)=>{
    const {orderId}=req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updated=await OrderModel.findByIdAndUpdate(orderId,{deliverStatus:true},{new:true});
        return res.status(200).json({
            message:"Deliverd",
            order:updated
        })   

    } catch (error) {
        next(error)
    }
})