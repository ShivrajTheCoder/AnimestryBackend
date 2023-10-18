const { validationResult } = require("express-validator");
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const Product = require("../Models/ProductModel");
const { NotFoundError } = require("../Utilities/CustomErrors");
const exp = module.exports;

exp.GetTrendingProd = RouterAsncErrorHandler(async (req, res, next) => {
    try {
        const trendingProducts = await Product.find().sort({ unitsSold: -1 }).limit(4);
        return res.status(200).json({
            message: "treanding products",
            trendingProducts
        });
    } catch (error) {
        next(error);
    }
});
exp.GetProudctById = RouterAsncErrorHandler(async (req, res, next) => {
    const { prodId } = req.query;
    try {
        const prod = await Product.findById(prodId);
        if (prod) {
            return res.status(200).json({
                product: prod,
                message: "Product Found",
            })
        }
        throw new NotFoundError("Not Found");
    }
    catch (error) {
        next(error);
    }
})

exp.UpdateProduct = RouterAsncErrorHandler(async (req, res, next) => {
    const { prodId } = req.query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const updated = await Product.findByIdAndUpdate(prodId, req.body);
        return res.status(200).json({
            product: updated,
            message: "Updated Product",
        })
    }
    catch (error) {
        next(error);
    }
})

exp.AddProduct = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const newProd = new Product(req.body);
        await newProd.save();
        return res.status(201).json({
            message: "Product added",
            newProd,
        })
    }
    catch (error) {
        next(error);
    }
})