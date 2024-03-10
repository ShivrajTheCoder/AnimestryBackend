const express = require("express");
const { check, validationResult, body } = require("express-validator");
const router = express.Router(); // Import the router object
const { addAddress, getAllUserAddress, getAddressById, removeAddress, updateAddress } = require("../Controllers/addressController")


router.route("/saveaddress/:userId")
    .post(authenticateToken,[
        check("userId").exists().isMongoId(),
        body('firstname').notEmpty().isString(),
        body('lastname').notEmpty().isString(),
        body('address').notEmpty().isString(),
        body('building').notEmpty().isString(),
        body('pincode').notEmpty().isString(),
        body('city').notEmpty().isString(),
        body('phonenumber').notEmpty().isString(),
    ], addAddress);

router.route("/getalluseraddress/:userId")
    .get(authenticateToken,[
        check("userId").exists().isMongoId(),
    ], getAllUserAddress);

router.route("/getaddressbyid/:addId")
    .get(authenticateToken,[
        check("addId").exists().isMongoId(),
    ], getAddressById);

router.route("/removeaddress/:addId")
    .delete(authenticateToken,[
        check("addId").exists().isMongoId(),
    ], removeAddress);

router.route("/updateadd/:addId")
    .put(authenticateToken,[
        check("addId").exists().isMongoId(),
        body().custom((value, { req }) => {
            // Check if any of the fields are present in the request body
            if (!req.body.firstname && !req.body.lastname && !req.body.address && !req.body.building && !req.body.pincode && !req.body.city && !req.body.phonenumber) {
                throw new Error('At least one field is required for update');
            }
            return true;
        })
    ], updateAddress);

module.exports = router;
