const { validationResult } = require('express-validator');
const Address = require('../Models/AddressModel');
const { NotFoundError } = require('../Utilities/CustomErrors');
const { RouterAsncErrorHandler } = require('../Middlewares/ErrorHandlerMiddleware');
const exp=module.exports;
exp.addAddress = RouterAsncErrorHandler(async(req, res, next) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;

    try {
        // Check the number of existing addresses for the user
        const addressCount = await Address.countDocuments({ userId });

        if (addressCount >= 3) {
            return res.status(400).json({ message: 'User already has three addresses' });
        }

        const { firstname, lastname, address, building, pincode, city, phonenumber } = req.body;
        const newAddress = new Address({ firstname, lastname, address, building, pincode, city, phonenumber, userId });
        const savedAddress = await newAddress.save();
        res.status(201).json({
            message:"Address Saved",
            savedAddress
        });
    } catch (error) {
        next(error);
    }
});


exp.getAllUserAddress = RouterAsncErrorHandler(async(req, res, next) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    try {
        const userAddresses = await Address.find({ userId });
        if(userAddresses.length<1){
            throw new NotFoundError("No address found!");
        }
        res.status(200).json({message:"User Address found!",userAddresses});
    } catch (error) {
        next(error);
    }
});

exp.getAddressById = RouterAsncErrorHandler(async(req, res, next) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { addId } = req.params;
    try {
        const address = await Address.findById(addId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json({
            message:"Address Found!",
            address
        });
    } catch (error) {
        next(error);
    }
});

exp.removeAddress = RouterAsncErrorHandler(async(req, res, next) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { addId } = req.params;
    try {
        const deletedAddress = await Address.findByIdAndDelete(addId);
        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json({ message: 'Address removed successfully' });
    } catch (error) {
        next(error);
    }
});

exp.updateAddress = RouterAsncErrorHandler(async(req, res, next) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { addId } = req.params;
    const { firstname, lastname, address, building, pincode, city, phonenumber } = req.body;
    try {
        const updatedAddress = await Address.findByIdAndUpdate(addId, { firstname, lastname, address, building, pincode, city, phonenumber }, { new: true });
        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json({
            message:"Address Updated",
            updatedAddress
        });
    } catch (error) {
        next(error);
    }
});
