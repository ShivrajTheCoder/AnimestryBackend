const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const Code=require("../Models/ReferalCodeModel");
const exp=module.exports;
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

exp.getAllCode = RouterAsncErrorHandler(async (req, res, next) => {
    try {
        const codes = await Code.find({isActive:true});
        if(codes.length>0){
            return res.status(200).json({ message: "Codes found!", codes });
        }
        else{
            throw new NotFoundError("No codes found!");
        }
    } catch (error) {
        next(error);
    }
});

exp.getCodeById = RouterAsncErrorHandler(async (req, res, next) => {
    const { codeId } = req.params;
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
