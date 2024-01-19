const express = require("express");
const { check, body } = require("express-validator");
const { GetTrendingProd, GetProudctById, UpdateProduct, AddProduct, AddNewCategory, GetAllProd, GetAllCategroies } = require("../Controllers/productController");
const { CustomError } = require("../Utilities/CustomErrors");
const router = express.Router();

router.route("/gettreandingproducts")
    .get(GetTrendingProd);

router.route("/getallproducts")
    .get(GetAllProd);

router.route("/getprodbyid/:prodId")
    .get([
        check("prodId").exists().isMongoId(),
    ], GetProudctById);

const atLeastOne = (value, { req }) => {
    if (value.name || value.category || value.price || value.description || value.anime) {
        return true;
    }
    throw new CustomError(400, "Invalid Parameters", "Invalid");
};

router.route("/updateprod/:prodId")
    .put([
        body("name").optional(),
        body("anime").optional(),
        body("category").optional().isMongoId(),
        body("price").optional().isNumeric(),
        body("description").optional(),
        body("colorOptions").optional().isArray(), // optional colorOptions
        body().custom(atLeastOne),
    ], UpdateProduct);

router.route("/addproduct").post([
    body("name").exists(),
    body("anime").exists(),
    body("category").exists().isMongoId(),
    body("price").exists().isNumeric(),
    body("description").exists(),
    body("colorOptions").exists().isArray(), // mandatory colorOptions
], AddProduct);

router.route("/addnewcategory").post([
    body("name").exists(),
], AddNewCategory);

router.route("/getallcategories")
    .get(GetAllCategroies)

module.exports = router;
