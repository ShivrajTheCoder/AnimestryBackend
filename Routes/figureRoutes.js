const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getAllFigures, deleteFigure, updateFigure, getFigure, addFigure } = require('../Controllers/figureController');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const router = express.Router();

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

router.post('/addnewfigure',
    addFigure
);

router.get('/getfigurebyid/:id',
    validate([
        param('id').notEmpty().isMongoId()
    ]),
    getFigure
);

router.put('/updatefigure/:id',
    validate([
        param('id').notEmpty().isMongoId(),
        body('name').optional(),
        body('anime').optional(),
        body('image_url').optional(),
        body('description').optional().isLength({ min: 25 })
    ]),
    updateFigure
);

router.delete('/deletefigure/:id',
    validate([
        param('id').notEmpty().isMongoId()
    ]),
    deleteFigure
);

router.get('/getallfigures',
    getAllFigures
);

module.exports = router;
