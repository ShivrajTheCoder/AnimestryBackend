const express = require("express");
const { body, check } = require("express-validator");
const { getCodeById, deactivateCode, addCode, getAllCode, applyCode } = require("../Controllers/referalCodeConroller");
const router = express.Router();

const authenticateToken = require("../Middlewares/UserAuthMiddleware");
const adminAuthenticateToken = require("../Middlewares/AdminAuthMiddleware");

router.route("/addcode")
    .post(adminAuthenticateToken,[
        body("code").exists(),
        body("discount").exists().isNumeric(),
    ], addCode)

router.route("/getallcodes")
    .get(getAllCode);
    
router.route("/:codeId")
    .get([
        check("codeId").exists().isMongoId(),
    ], getCodeById)
    .delete([
        check("codeId").exists().isMongoId(),
    ], deactivateCode)

router.route("/apply")
    .post(authenticateToken,[
        body("code").exists().isString(),
    ],applyCode)


module.exports = router;