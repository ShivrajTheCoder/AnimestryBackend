const express = require("express");
const { check, body } = require("express-validator");
const { GetTrendingProd, GetProudctById, UpdateProduct, AddProduct } = require("../Controllers/productController");
const { CustomError } = require("../Utilities/CustomErrors");
const router = express.Router();

router.route("/gettreandingproducts")
    .get(GetTrendingProd)

router.route("/getprodbyid/:prodId")
    .get([
        check("prodId").exists().isMongoId(),
    ], GetProudctById)


const atleastone = (value, { req }) => {
    if (req.name || req.category || req.price || req.description) {
        return true;
    }
    throw new CustomError(400, "Invalid Parameters", "Invalid")
}
router.route("/updateprod/:prodId")
    .put([
        body("name").optional().isString(),
        body("category").optional().isMongoId(),
        body("price").optional().isNumeric(),
        body("description").optional(), isString(),
        body().custom(atleastone)
    ], UpdateProduct)

router.route("/addprod").post([
    body("name").exists().isString(),
    body("category").exists().isMongoId(),
    body("price").exists().isNumeric(),
    body("description").exists().isString(),
], AddProduct)
module.exports = router;