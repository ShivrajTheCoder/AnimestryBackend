const { validationResult } = require("express-validator");
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CategoryModel = require("../Models/CategoryModel");
const OrderModel = require("../Models/OrderModel");
const Order=require("../Models/OrderModel");
const Products=require("../Models/ProductModel");
const Users=require("../Models/UserModel");
const Admin=require("../Models/AdminModel");
const { NotFoundError } = require("../Utilities/CustomErrors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
const USER_KEY=process.env.JWT_SECRET_KEY_ADMIN;
exp.Login = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Incorrect email or password." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect email or password." });
        }
        const token = jwt.sign({ _id: user._id }, USER_KEY);

        res.status(200).json({ message: "Login successful", token, userId: user._id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error logging in." });
    }
};

const saltRounds=10;
exp.Signup=RouterAsncErrorHandler(async(req,res,next)=>{
    const {name,email,password}=req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields: name, email, password, and verification code.' });
        }

        const user = await Admin.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User Already Exists' });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new Admin({
            name,
            email,
            password: hashedPassword
        })

        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User created successfully.', user: savedUser.email });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating user.' });
    }
})