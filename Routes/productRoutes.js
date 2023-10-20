const express = require("express");
const { check, body } = require("express-validator");
const { GetTrendingProd, GetProudctById, UpdateProduct, AddProduct, AddNewCategory } = require("../Controllers/productController");
const { CustomError } = require("../Utilities/CustomErrors");
const router = express.Router();

router.route("/gettreandingproducts")
    .get(GetTrendingProd)

router.route("/getprodbyid/:prodId")
    .get([
        check("prodId").exists().isMongoId(),
    ], GetProudctById)


const atleastone = (value, { req }) => {

    if (value.name || value.category ||value.price || value.description || value.anime) {
        return true;
    }
    throw new CustomError(400, "Invalid Parameters", "Invalid")
}
router.route("/updateprod/:prodId")
    .put([
        body("name").optional(),
        body("anime").optional(),
        body("category").optional().isMongoId(),
        body("price").optional().isNumeric(),
        body("description").optional(),
        body().custom(atleastone)
    ], UpdateProduct)

router.route("/addproduct").post([
    body("name").exists(),
    body("anime").exists(),
    body("category").exists().isMongoId(),
    body("price").exists().isNumeric(),
    body("description").exists(),
], AddProduct)

router.route("/addnewcategory").post([
    body("name").exists(),
],AddNewCategory)

module.exports = router;