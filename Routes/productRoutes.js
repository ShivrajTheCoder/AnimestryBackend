const express = require("express");
const { check, body } = require("express-validator");
const { GetTrendingProd, GetProudctById, UpdateProduct, AddProduct, AddNewCategory, GetAllProd, GetAllCategories, DeleteProduct, SearchProducts, AddDiscount, GetByCategory } = require("../Controllers/productController");
const { CustomError } = require("../Utilities/CustomErrors");
const router = express.Router();
const multer = require('multer');
const { uploadImages, uploadImage } = require("../Utilities/aws/S3");
const adminAuthenticateToken = require("../Middlewares/AdminAuthMiddleware");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Uploads folder where files will be stored
    },
    filename: function (req, file, cb) {
        // Use original file name with a timestamp to avoid overwriting files with the same name
        cb(null, Date.now() + '-' + file.originalname)
    }
});
// const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage: storage })
const multipleUpload=upload.fields([{name:"image",maxCount:1},{name:"otherimages",maxCount:3}])

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
    .put(adminAuthenticateToken,[
        body("name").optional(),
        body("anime").optional(),
        body("category").optional().isMongoId(),
        body("price").optional().isNumeric(),
        body("description").optional(),
        body("colorOptions").optional().isArray(), // optional colorOptions
        body().custom(atLeastOne),
    ], UpdateProduct);

router.route("/addproduct").post(adminAuthenticateToken,multipleUpload, AddProduct);

router.route("/addnewcategory").post(adminAuthenticateToken,AddNewCategory);

router.route("/getallcategories")
    .get(GetAllCategories)

router.route("/deleteproduct/:productId")
    .delete(adminAuthenticateToken,[
        check("productId").exists().isMongoId()
    ], DeleteProduct)

router.route("/search")
    .post([
        body("name").optional(),
        body("category").optional(),
        body("anime").optional()
    ], SearchProducts)

router.route("/adddiscount/:productId")
    .post(adminAuthenticateToken,[
        body("discount").exists().isNumeric(),
        check("productId").exists().isMongoId()
    ], AddDiscount)

router.route("/getbycategory/:categoryId")
    .get([
        check("categoryId").exists().isMongoId(),
    ], GetByCategory)



module.exports = router;
