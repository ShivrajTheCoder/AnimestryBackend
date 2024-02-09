
const { RouterAsncErrorHandler } = require('../Middlewares/ErrorHandlerMiddleware');
const Anime = require('../Models/AnimeFigureModel');

const exp = module.exports;

exp.addFigure = RouterAsncErrorHandler(async (req, res) => {
    const { name, anime, image, other_images, description } = req.body;
    // const newFigure = await Anime.create({
    //     name,
    //     anime,
    //     image_url,
    //     other_images,
    //     description
    // });
    console.log(req.body);
    return res.status(200).json({
        message: "Figure Added",
        // figure: newFigure
    });
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

    const figures = await Anime.find()
        .skip((page - 1) * perPage)
        .limit(perPage);

    const totalFigures = await Anime.countDocuments();
    const totalPages = Math.ceil(totalFigures / perPage);

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
    const deletedFigure = await Anime.findByIdAndDelete(figureId);
    if (!deletedFigure) {
        throw new Error("Figure not found");
    }
    return res.status(200).json({
        message: "Figure Deleted",
        figure: deletedFigure
    });
});
