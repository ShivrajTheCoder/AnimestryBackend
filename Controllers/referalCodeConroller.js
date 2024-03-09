const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const Code = require("../Models/ReferalCodeModel");
const exp = module.exports;
const { NotFoundError, DuplicateDataError } = require("../Utilities/CustomErrors");
const { validationResult } = require("express-validator");

exp.addCode = RouterAsncErrorHandler(async (req, res, next) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: "Validation failed", errors: errors.array() });
    }

    try {
        let { code, discount, isActive } = req.body;
        // Convert code to uppercase
        code = code.toUpperCase();
        const newCode = new Code({
            code,
            discount,
            isActive: isActive || true // If isActive is not provided, default to true
        });
        const savedCode = await newCode.save();
        return res.status(201).json({ message: "Code added successfully", code: savedCode });
    } catch (error) {
        if (error.code === 11000) {
            next(new DuplicateDataError("Referral code already exists"));
        } else {
            next(error);
        }
    }
});


exp.deactivateCode = RouterAsncErrorHandler(async (req, res, next) => {
    const { codeId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: "Validation failed", errors: errors.array() });
    }
    try {
        const code = await Code.findById(codeId);
        if (!code) {
            throw new NotFoundError("Referral code not found");
        }
        code.isActive = false;
        await code.save();
        return res.status(200).json({ message: "Referral code deactivated successfully", code });
    } catch (error) {
        next(error);
    }
});

const itemsPerPage = 3; // You can adjust this value as needed

exp.getAllCode = RouterAsncErrorHandler(async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let skip = (page - 1) * itemsPerPage;

        const codes = await Code.find({ isActive: true })
            .skip(skip)
            .limit(itemsPerPage)
            .exec();

        const totalCodes = await Code.countDocuments({ isActive: true });

        if (codes.length > 0) {
            const totalPages = Math.ceil(totalCodes / itemsPerPage);
            return res.status(200).json({ message: "Codes found!", codes, currentPage: page, totalPages });
        } else {
            throw new NotFoundError("No codes found!");
        }
    } catch (error) {
        next(error);
    }
});


exp.getCodeById = RouterAsncErrorHandler(async (req, res, next) => {
    const { codeId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: "Validation failed", errors: errors.array() });
    }
    try {
        const code = await Code.findById(codeId);
        if (!code) {
            throw new NotFoundError("Referral code not found");
        }
        return res.status(200).json({ message: "Code found!", code });
    } catch (error) {
        next(error);
    }
});

exp.applyCode = RouterAsncErrorHandler(async (req, res, next) => {
    const { code } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: "Validation failed", errors: errors.array() });
    }
    try {
        const foundC = await Code.findOne({ code, isActive: true });
        if (!foundC) {
            return res.status(422).json({
                message: "Invalid Code",
            })
        }
        return res.status(200).json({
            message: "Code found!",
            code: foundC
        })
    }
    catch (error) {
        next(error);
    }
})
