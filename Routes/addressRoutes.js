const express = require("express");
const { check, validationResult, body } = require("express-validator");
const router = express.Router(); // Import the router object
const {addAddress, getAllUserAddress, getAddressById, removeAddress, updateAddress} =require("../Controllers/addressController")


router.route("/saveaddress/:userId")
    .post([
        check("userId").exists().isMongoId(),
        check("firstname").exists().notEmpty().withMessage("First name is required"),
        check("lastname").exists().notEmpty().withMessage("Last name is required"),
        check("address").exists().isLength({ min: 10 }).withMessage("Address must be at least 10 characters long"),
        check("building").exists().notEmpty().withMessage("Building is required"),
        check("pincode").exists().isNumeric().isLength({ min: 6, max: 6 }).withMessage("Pincode must be a 6-digit number"),
        check("city").exists().notEmpty().withMessage("City is required"),
        check("phonenumber").exists().isNumeric().isLength({ min: 10, max: 10 }).withMessage("Phone number must be a 10-digit number"),
    ],addAddress);

router.route("/getalluseraddress/:userId")
    .get([
        check("userId").exists().isMongoId(),
    ],getAllUserAddress);

router.route("/getaddressbyid/:addId")
    .get([
        check("addId").exists().isMongoId(),
    ],getAddressById);

router.route("/removeaddress/:addId")
    .delete([
        check("addId").exists().isMongoId(),
    ],removeAddress);

router.route("/updateadd/:addId")
    .put([
        check("addId").exists().isMongoId(),
        body().custom((value, { req }) => {
            // Check if any of the fields are present in the request body
            if (!req.body.firstname && !req.body.lastname && !req.body.address && !req.body.building && !req.body.pincode && !req.body.city && !req.body.phonenumber) {
                throw new Error('At least one field is required for update');
            }
            return true;
        })
    ],updateAddress);

module.exports = router;
