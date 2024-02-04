const { validationResult } = require("express-validator");
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const ProductModel = require("../Models/ProductModel");
const CategoryModel = require("../Models/CategoryModel");
const { NotFoundError, DuplicateDataError } = require("../Utilities/CustomErrors");
const Fuse = require("fuse.js");
const exp = module.exports;

exp.GetAllProd = RouterAsncErrorHandler(async (req, res, next) => {
    try {
        const products = await ProductModel.find({});
        if (products.length > 0) {
            return res.status(200).json({
                message: "Products found!",
                products,
            });
        } else {
            throw new NotFoundError("Products not found!");
        }
    } catch (error) {
        next(error);
    }
});

exp.GetTrendingProd = RouterAsncErrorHandler(async (req, res, next) => {
    try {
        const trendingProducts = await ProductModel.find().sort({ unitsSold: -1 }).limit(3);
        return res.status(200).json({
            message: "Trending products",
            trendingProducts,
        });
    } catch (error) {
        next(error);
    }
});

exp.GetProudctById = RouterAsncErrorHandler(async (req, res, next) => {
    const { prodId } = req.params;
    try {
        const prod = await ProductModel.findById(prodId);
        if (prod) {
            return res.status(200).json({
                product: prod,
                message: "Product Found",
            });
        }
        throw new NotFoundError("Not Found");
    } catch (error) {
        next(error);
    }
});

exp.UpdateProduct = RouterAsncErrorHandler(async (req, res, next) => {
    const { prodId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const updated = await ProductModel.findByIdAndUpdate(prodId, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json({
            product: updated,
            message: "Updated Product",
        });
    } catch (error) {
        next(error);
    }
});

exp.AddProduct = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const newProd = new ProductModel({ ...req.body, image_url: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png" });
        await newProd.save();
        return res.status(201).json({
            message: "Product added",
            newProd,
        });
    } catch (error) {
        next(error);
    }
});

exp.AddNewCategory = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { name } = req.body;
    try {
        const category = await CategoryModel.find({ name });
        if (category.length > 0) {
            throw new DuplicateDataError();
        }
        const newCat = new CategoryModel(req.body);
        const cat = await newCat.save();
        return res.status(201).json({
            message: "New Category added",
            category: cat,
        });
    } catch (error) {
        next(error);
    }
});

exp.GetAllCategroies=RouterAsncErrorHandler(async(req,res,next)=>{
    try{
        const categories=await CategoryModel.find({});
        if(categories.length<1){
            throw new NotFoundError("Categories not found!");
        }
        return res.status(200).json({
            message:"Categories found!",
            categories
        })
    }
    catch(error){
        next(error);
    }
})

exp.DeleteProduct=RouterAsncErrorHandler(async(req,res,next)=>{
    const {productId}=req.params;
    try{
        const deleted=await ProductModel.findByIdAndDelete(productId);
        return res.status(200).json({
            message:"Product deleted",
            deleted
        })
    }
    catch(error){
        next(error);
    }
})

exp.SearchProducts=RouterAsncErrorHandler(async(req,res,next)=>{
    try {
        const { name, category, anime } = req.query;

        const allProducts = await ProductModel.find(); // Fetch all products for fuzzy search

        const fuseOptions = {
            keys: ["name", "category", "anime"],
            threshold: 0.4, // Adjust the threshold based on your preference
        };

        const fuse = new Fuse(allProducts, fuseOptions);

        // Perform a fuzzy search for each parameter
        const nameResults = name ? fuse.search(name) : allProducts;
        const categoryResults = category ? fuse.search(category) : allProducts;
        const animeResults = anime ? fuse.search(anime) : allProducts;

        // Combine results to remove duplicates and maintain relevance
        const combinedResults = Array.from(
            new Set([...nameResults, ...categoryResults, ...animeResults])
        );

        return res.status(200).json({
            results:combinedResults,
            message:"Results found!"
        })
    } catch (error) {
        next(error);
    }
})