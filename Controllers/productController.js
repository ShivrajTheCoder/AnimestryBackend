const { validationResult } = require("express-validator");
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const Product = require("../Models/ProductModel");
const Category = require("../Models/CategoryModel");
const { NotFoundError, DuplicateDataError } = require("../Utilities/CustomErrors");
const ProductModel = require("../Models/ProductModel");
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
    const { prodId } = req.params;
    console.log(prodId,"here is the prodid");
    try {
        const prod =await ProductModel.findById(prodId);
        console.log(prod);
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
    const { prodId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const updated = await Product.findByIdAndUpdate(prodId, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json({
            product: updated,
            message: "Updated Product",
        });
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
        const newProd = new Product({ ...req.body, image_url: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png" });
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

exp.AddNewCategory = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { name } = req.body;
    try {
        const category = await Category.find({ name });
        if (category.length > 0) {
            throw new DuplicateDataError();
        }
        const newCat = new Category(req.body);
        const cat = await newCat.save();
        return res.status(201).json({
            message: "New Category added",
            category: cat
        })
    }
    catch (error) {
        next(error);
    }
})