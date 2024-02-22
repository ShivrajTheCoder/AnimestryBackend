
const { RouterAsncErrorHandler } = require('../Middlewares/ErrorHandlerMiddleware');
const OtherProducts = require('../Models/OtherProducts');
const { DuplicateDataError, NotFoundError } = require('../Utilities/CustomErrors');
const fs = require("fs");
const { uploadImage } = require('../Utilities/aws/S3');
const { validationResult } = require('express-validator');
const exp = module.exports;

exp.addOtherProduct = RouterAsncErrorHandler(async (req, res,next) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { name, anime, description } = req.body;
    const image = req.file;
    if (!name || !anime || !description) {
        return res.status(422).json({
            message: "Name, anime, and description are required fields",
        });
    }
    if (name.trim().length === 0) {
        return res.status(422).json({
            message: "Name cannot be empty",
        });
    }
    if (anime.trim().length === 0) {
        return res.status(422).json({
            message: "OtherProducts name cannot be empty",
        });
    }
    if (description.trim().length < 25) {
        return res.status(422).json({
            message: "Description must be at least 25 characters long",
        });
    }
    try {
        const existing = await OtherProducts.find({ name });
        if (existing.lenght > 0) {
            throw new DuplicateDataError("Figure Exisits");
        }
        const response = await uploadImage(req.file, name);
        const image_url = response.Location;
        const newOtherProduct = new OtherProducts({
            ...req.body, image_url
        })
        const newOtherPro = await newOtherProduct.save();
        fs.unlinkSync(req.file.path);
        return res.status(201).json({
            message: "New figure added",
            product: newOtherPro,
        });
    }
    catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
});


exp.getOtherProductById = RouterAsncErrorHandler(async (req, res) => {
    const productId = req.params.id;
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const figure = await OtherProducts.findById(figureId);
    if (!figure) {
        throw new Error("Figure not found");
    }
    return res.status(200).json({
        message:"Product Found!",
        product:figure
    });
});
exp.getAllOtherProducts = RouterAsncErrorHandler(async (req, res) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const page = parseInt(req.query.page) || 1;
    const perPage = 8;

    const figures = await OtherProducts.find({active:true})
        .skip((page - 1) * perPage)
        .limit(perPage);

    const totalFigures = await OtherProducts.countDocuments();
    const totalPages = Math.ceil(totalFigures / perPage);
    if(figures.length<1){
        throw new NotFoundError("Figures not found!");
    }
    return res.status(200).json({
        otherproducts:figures,
        currentPage: page,
        totalPages
    });
});

exp.updateOtherProduct = RouterAsncErrorHandler(async (req, res) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const figureId = req.params.id;
    const { name, anime, image_url, other_images, description } = req.body;
    const updatedProduct = await OtherProducts.findByIdAndUpdate(figureId, {
        name,
        anime,
        image_url,
        other_images,
        description
    }, { new: true });
    if (!updatedProduct) {
        throw new Error("Other Product not found");
    }
    return res.status(200).json({
        message: "Prouct Updated",
        updatedProduct
    });
});

exp.deleteOtherProduct = RouterAsncErrorHandler(async (req, res) => {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const productId = req.params.id;
    const deletedProduct = await OtherProducts.findByIdAndUpdate(productId,{active:false});
    if (!deletedProduct) {
        throw new Error("Figure not found");
    }
    return res.status(200).json({
        message: "Figure Deleted",
        product:deletedProduct
    });
});
