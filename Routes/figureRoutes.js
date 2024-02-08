const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getAllFigures, deleteFigure, updateFigure, getFigure, addFigure } = require('../Controllers/figureController');


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

router.post('/add',
    validate([
        body('name').notEmpty(),
        body('anime').notEmpty(),
        body('image_url').notEmpty(),
        body('description').isLength({ min: 25 })
    ]),
    addFigure
);

router.get('/:id',
    validate([
        param('id').notEmpty().isMongoId()
    ]),
    getFigure
);

router.put('/:id',
    validate([
        param('id').notEmpty().isMongoId(),
        body('name').optional(),
        body('anime').optional(),
        body('image_url').optional(),
        body('description').optional().isLength({ min: 25 })
    ]),
    updateFigure
);

router.delete('/:id',
    validate([
        param('id').notEmpty().isMongoId()
    ]),
    deleteFigure
);

router.get('/all',
    getAllFigures
);

module.exports = router;
