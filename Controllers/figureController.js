
const { RouterAsncErrorHandler } = require('../Middlewares/ErrorHandlerMiddleware');
const Anime = require('../Models/AnimeFigureModel');
const { DuplicateDataError, NotFoundError } = require('../Utilities/CustomErrors');
const fs = require("fs");
const { uploadImage } = require('../Utilities/aws/S3');
const exp = module.exports;

exp.addFigure = RouterAsncErrorHandler(async (req, res,next) => {
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
            message: "Anime name cannot be empty",
        });
    }
    if (description.trim().length < 25) {
        return res.status(422).json({
            message: "Description must be at least 25 characters long",
        });
    }
    try {
        const existing = await Anime.find({ name });
        if (existing.lenght > 0) {
            throw new DuplicateDataError("Figure Exisits");
        }
        const response = await uploadImage(req.file, name);
        const image_url = response.Location;
        const newFig = new Anime({
            ...req.body, image_url
        })
        const fig = await newFig.save();
        fs.unlinkSync(req.file.path);
        return res.status(201).json({
            message: "New figure added",
            figure: fig,
        });
    }
    catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
});


exp.getFigure = RouterAsncErrorHandler(async (req, res) => {
    const figureId = req.params.id;
    const figure = await Anime.findById(figureId);
    if (!figure) {
        throw new Error("Figure not found");
    }
    return res.status(200).json(figure);
});
exp.getAllFigures = RouterAsncErrorHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 8;

    const figures = await Anime.find({active:true})
        .skip((page - 1) * perPage)
        .limit(perPage);

    const totalFigures = await Anime.countDocuments();
    const totalPages = Math.ceil(totalFigures / perPage);
    if(figures.length<1){
        throw new NotFoundError("Figures not found!");
    }
    return res.status(200).json({
        figures,
        currentPage: page,
        totalPages
    });
});

exp.updateFigure = RouterAsncErrorHandler(async (req, res) => {
    const figureId = req.params.id;
    const { name, anime, image_url, other_images, description } = req.body;
    const updatedFigure = await Anime.findByIdAndUpdate(figureId, {
        name,
        anime,
        image_url,
        other_images,
        description
    }, { new: true });
    if (!updatedFigure) {
        throw new Error("Figure not found");
    }
    return res.status(200).json({
        message: "Figure Updated",
        figure: updatedFigure
    });
});

exp.deleteFigure = RouterAsncErrorHandler(async (req, res) => {
    const figureId = req.params.id;
    const deletedFigure = await Anime.findByIdAndUpdate(figureId,{active:false});
    if (!deletedFigure) {
        throw new Error("Figure not found");
    }
    return res.status(200).json({
        message: "Figure Deleted",
        figure: deletedFigure
    });
});
