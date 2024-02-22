const { validationResult } = require("express-validator");
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const ProductModel = require("../Models/ProductModel");
const CategoryModel = require("../Models/CategoryModel");
const { NotFoundError, DuplicateDataError } = require("../Utilities/CustomErrors");
const Fuse = require("fuse.js");
const { uploadImage } = require("../Utilities/aws/S3");
const exp = module.exports;
const fs = require("fs");
const { response } = require("express");
const MOBILE_ITEMS_PER_PAGE = 4;
const DESKTOP_ITEMS_PER_PAGE = 8;

const isMobile = false; // This should be determined based on the request, assuming it's hardcoded for demonstration purposes

const itemsPerPage = isMobile ? MOBILE_ITEMS_PER_PAGE : DESKTOP_ITEMS_PER_PAGE;

exp.GetAllProd = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const products = await ProductModel.find({ active: true })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const totalProducts = await ProductModel.countDocuments({ active: true });

        if (products.length > 0) {
            const totalPages = Math.ceil(totalProducts / itemsPerPage);

            return res.status(200).json({
                message: "Products found!",
                products,
                currentPage: page,
                totalPages,
            });
        } else {
            throw new NotFoundError("Products not found!");
        }
    } catch (error) {
        next(error);
    }
});


exp.GetTrendingProd = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const trendingProducts = await ProductModel.find({active:true}).sort({ unitsSold: -1 }).limit(3);
        return res.status(200).json({
            message: "Trending products",
            trendingProducts,
        });
    } catch (error) {
        next(error);
    }
});

exp.GetProudctById = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
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
    // Validate fields
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { name, price, description, category, anime, colorOptions } = req.body;

    if (!req.file) {
        return res.status(422).json({
            message: "Image not present",
        });
    }

    if (!name || !price || !description || !category || !anime || !colorOptions) {
        return res.status(422).json({
            message: "All fields are mandatory",
        });
    }

    if (description.length < 50) {
        return res.status(422).json({
            message: "Description should be at least 50 characters long",
        });
    }

    if (isNaN(price) || price <= 0) {
        return res.status(422).json({
            message: "Price should be a positive number",
        });
    }

    // If all validations pass, proceed to the next steps
    // console.log(req.file, req.body);
    try {

        const response = await uploadImage(req.file, name);
        // console.log(response);
        const image_url = response.Location;
        const newProd = new ProductModel({
            ...req.body, image_url,colorOptions:JSON.parse(colorOptions)

        });
        const savedPro = await newProd.save();
        // console.log(savedPro);
        fs.unlinkSync(req.file.path);
        return res.status(201).json({
            message: 'Product added',
            product: savedPro
        });
    }
    catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }

});

exp.AddNewCategory = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { name } = req.body;
    if(!name || name.length<2){
        return res.status(422).json({
            message:"Invalid name"
        })
    }
    try {
        const category = await CategoryModel.find({ name });
        if (category.length > 0) {
            throw new DuplicateDataError();
        }
        const newCat = new CategoryModel({name});
        // console.log(newCat);
        const cat = await newCat.save();
        return res.status(201).json({
            message: "New Category added",
            category: cat,
        });
    } catch (error) {
        next(error);
    }
});

exp.GetAllCategories = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const categories = await CategoryModel.find({});

        // If there are no categories found, throw an error
        if (categories.length < 1) {
            throw new NotFoundError("Categories not found!");
        }

        return res.status(200).json({
            message: "Categories found!",
            categories
        });
    } catch (error) {
        next(error);
    }
});



exp.DeleteProduct = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { productId } = req.params;
    try {
        const deleted = await ProductModel.findByIdAndUpdate(productId,{active:false});
        return res.status(200).json({
            message: "Product deleted",
            deleted
        })
    }
    catch (error) {
        next(error);
    }
})

exp.SearchProducts = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
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
            results: combinedResults,
            message: "Results found!"
        })
    } catch (error) {
        next(error);
    }
})