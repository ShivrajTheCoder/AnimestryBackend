const express = require('express');
const { body, param, validationResult } = require('express-validator');
const multer = require('multer');
const { addOtherProduct, getOtherProductById, updateOtherProduct, deleteOtherProduct, getAllOtherProducts } = require('../Controllers/otherProductsController');
const upload = multer({ dest: 'uploads/' })
const authenticateToken = require("../Middlewares/UserAuthMiddleware");
const adminAuthenticateToken = require("../Middlewares/AdminAuthMiddleware");

const router = express.Router();
const multipleUpload = upload.fields([{ name: "image", maxCount: 1 }, { name: "otherimages", maxCount: 3 }])
// Validation middleware

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ errors: errors.array() });
    };
};

router.post('/addnewotherproduct',
    adminAuthenticateToken,
    multipleUpload,
    addOtherProduct
);

router.get('/getotherproductbyid/:id',
    validate([
        param('id').notEmpty().isMongoId()
    ]),
    getOtherProductById
);

router.put('/updateotherprouct/:id',
    validate(adminAuthenticateToken,[
        param('id').notEmpty().isMongoId(),
        body('name').optional(),
        body('anime').optional(),
        body('image_url').optional(),
        body('description').optional().isLength({ min: 25 })
    ]),
    updateOtherProduct
);

router.delete('/deleteotherproduct/:id',
    validate(adminAuthenticateToken,[
        param('id').notEmpty().isMongoId()
    ]),
    deleteOtherProduct
);

router.get('/getallotherproducts',
    getAllOtherProducts
);

module.exports = router;
