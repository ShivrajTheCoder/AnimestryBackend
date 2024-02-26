const { validationResult } = require("express-validator");
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const ProductModel = require("../Models/ProductModel");
const OtherProducts = require("../Models/OtherProducts");
const CategoryModel = require("../Models/CategoryModel");
const { NotFoundError, DuplicateDataError } = require("../Utilities/CustomErrors");
const Fuse = require("fuse.js");
const { uploadImage } = require("../Utilities/aws/S3");
const exp = module.exports;
const fs = require("fs");
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
        const trendingProducts = await ProductModel.find({ active: true }).sort({ unitsSold: -1 }).limit(3);
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
            ...req.body, image_url, colorOptions: JSON.parse(colorOptions)

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
    if (!name || name.length < 2) {
        return res.status(422).json({
            message: "Invalid name"
        })
    }
    try {
        const category = await CategoryModel.find({ name });
        if (category.length > 0) {
            throw new DuplicateDataError();
        }
        const newCat = new CategoryModel({ name });
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
        const deleted = await ProductModel.findByIdAndUpdate(productId, { active: false });
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
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    
    try {
        const { name, category, anime } = req.body;

        // Fetch products from both ProductModel and OtherProducts
        const productsFromProductModel = await ProductModel.find().populate('category', 'name');
        const productsFromOtherProducts = await OtherProducts.find().populate('category', 'name');

        // Combine products from both models
        let allProducts = [...productsFromProductModel, ...productsFromOtherProducts];

        const fuseOptions = {
            keys: ["name", "category.name", "anime"], // Include category name for searching
            threshold: 0.3, // Adjust the threshold based on your preference
        };

        const fuse = new Fuse(allProducts, fuseOptions);

        let results = allProducts;
        if (name) {
            const nameResults = fuse.search(name);
            results = results.filter(product => nameResults.some(result => result.item._id.toString() === product._id.toString()));
        }
        if (category) {
            const categoryResults = fuse.search(category);
            results = results.filter(product => categoryResults.some(result => result.item._id.toString() === product._id.toString()));
        }
        if (anime) {
            const animeResults = fuse.search(anime);
            results = results.filter(product => animeResults.some(result => result.item._id.toString() === product._id.toString()));
        }

        // Separate products from ProductModel and OtherProducts
        const productsFromProductModelFiltered = results.filter(product => productsFromProductModel.some(p => p._id.toString() === product._id.toString()));
        const productsFromOtherProductsFiltered = results.filter(product => productsFromOtherProducts.some(p => p._id.toString() === product._id.toString()));

        return res.status(200).json({
            clothes: productsFromProductModelFiltered,
            others: productsFromOtherProductsFiltered,
            message: "Results found!"
        });
    } catch (error) {
        next(error);
    }
});


exp.AddDiscount = RouterAsncErrorHandler(async(req, res, next) => {
    const { productId } = req.params;
    const { discount } = req.body;
    if(discount>75 || discount<0){
        return res.status(422).json({
            message:"Dicount can't be greater than 75% or less than 0"
        })
    }
    try {
        // Check if the product is in Products or OtherProducts model
        const productToUpdate = await ProductModel.findById(productId) || await OtherProducts.findById(productId);

        if (!productToUpdate) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update the discount value
        productToUpdate.discount = discount;
        const updatedProduct = await productToUpdate.save();

        return res.status(200).json({ message: 'Discount added successfully', updatedProduct });
    } catch (error) {
        next(error);
    }
});

exp.GetByCategory = RouterAsncErrorHandler(async (req, res, next) => {
    const { categoryId } = req.params;
    try {
        // Search for products in ProductModel
        const productsFromProductModel = await ProductModel.find({ category: categoryId });

        // Search for products in OtherProducts
        const productsFromOtherProducts = await OtherProducts.find({ category: categoryId });

        // Check if either of the arrays is empty, throw NotFoundError if both are empty
        if (productsFromProductModel.length === 0 && productsFromOtherProducts.length === 0) {
            throw new NotFoundError("No products found for the given category.");
        }

        // Send response with products separately
        res.status(200).json({
            message: "Items found!",
            products: {
                clothes:productsFromProductModel,
                others:productsFromOtherProducts
            }
        });
    } catch (error) {
        next(error);
    }
});
