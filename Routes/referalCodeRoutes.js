const express = require("express");
const { body, check } = require("express-validator");
const { getCodeById, deactivateCode, addCode, getAllCode } = require("../Controllers/referalCodeConroller");
const router = express.Router();

router.route("/addcode")
    .post([
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




module.exports = router;