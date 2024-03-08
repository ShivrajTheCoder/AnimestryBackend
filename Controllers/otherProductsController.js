
const { RouterAsncErrorHandler } = require('../Middlewares/ErrorHandlerMiddleware');
const OtherProducts = require('../Models/OtherProducts');
const { DuplicateDataError, NotFoundError } = require('../Utilities/CustomErrors');
const fs = require("fs");
const { uploadImage, uploadImages } = require('../Utilities/aws/S3');
const { validationResult } = require('express-validator');
const removeFileFromLocal = require('../Utilities/RemoveFileFromLocal');
const exp = module.exports;

const validateOtherProduct = (req) => {
    const { name, anime, description, category } = req.body;
    const { otherimages, image } = req.files;
    // console.log(req.files);
    if (!image || image.length < 1) {
        return {
            failed: true,
            message: "Image is required",
        }
    }
    if (!name || !anime || !description || !category ) {
        return {
            failed: true,
            message: "Name, anime, description, category, and at least one other image are required fields",
        }
    }

    if (name.trim().length === 0 || anime.trim().length === 0) {
        return {
            failed: true,
            message: "Name and anime cannot be empty",
        };
    }

    if (description.trim().length < 25) {
        return {
            failed: true,
            message: "Description must be at least 25 characters long",
        };
    }

    return {
        failed: false
    };
};

exp.addOtherProduct = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { image, otherimages } = req.files;
    const validation = validateOtherProduct(req);
    if (validation.failed) {
        removeFileFromLocal(image,otherimages)
        return res.status(422).json({
            message: validation.message
        });
    }

    const { name, category } = req.body;
    // console.log(image);
    try {
        const existing = await OtherProducts.find({ name });
        if (existing.length > 0) {
            throw new DuplicateDataError("Other Product Exists");
        }

        const response = await uploadImages(image);
        const image_url = response[0].Location;
        let otherResp;
        let other_images;
        if (otherimages?.length > 0) {
            otherResp = await uploadImages(otherimages);
            other_images = otherResp.map((image) => image.Location);
        }


        const newOtherProduct = new OtherProducts({
            ...req.body,
            image_url,
            other_images: other_images?.length > 0 ? other_images : [],
            category
        });

        const newOtherPro = await newOtherProduct.save();

        removeFileFromLocal(image,otherimages);


        return res.status(201).json({
            message: "New product added",
            product: newOtherPro,
        });
    }
    catch (error) {
        const { image, otherimages } = req.files;
        // console.log(image);
        removeFileFromLocal(image,otherimages);
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
    const product = await OtherProducts.findById(productId);
    if (!product) {
        throw new Error("Other Product not found");
    }
    return res.status(200).json({
        message: "Product Found!",
        product: product
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

    const figures = await OtherProducts.find({ active: true })
        .skip((page - 1) * perPage)
        .limit(perPage);

    const totalFigures = await OtherProducts.countDocuments();
    const totalPages = Math.ceil(totalFigures / perPage);
    if (figures.length < 1) {
        throw new NotFoundError("Figures not found!");
    }
    return res.status(200).json({
        otherproducts: figures,
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
    const productId = req.params.id;
    const { name, anime, image_url, other_images, description } = req.body;
    const updatedProduct = await OtherProducts.findByIdAndUpdate(productId, {
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
    const deletedProduct = await OtherProducts.findByIdAndUpdate(productId, { active: false });
    if (!deletedProduct) {
        throw new Error("Other Product not found");
    }
    return res.status(200).json({
        message: "Other Product Deleted",
        product: deletedProduct
    });
});
