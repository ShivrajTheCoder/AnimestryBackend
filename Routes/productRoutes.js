const express = require("express");
const { check, body } = require("express-validator");
const { GetTrendingProd, GetProudctById, UpdateProduct, AddProduct, AddNewCategory, GetAllProd,GetAllCategories, DeleteProduct, SearchProducts } = require("../Controllers/productController");
const { CustomError } = require("../Utilities/CustomErrors");
const router = express.Router();
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
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

router.route("/addproduct").post(upload.single('image'), AddProduct);

router.route("/addnewcategory").post(upload.single("image"), AddNewCategory);

router.route("/getallcategories")
    .get(GetAllCategories)

router.route("/deleteproduct/:productId")
    .delete([
        check("productId").exists().isMongoId()
    ],DeleteProduct)

router.route("/search/:query")
    .get([
        check("query").exists()
    ],SearchProducts)



module.exports = router;
