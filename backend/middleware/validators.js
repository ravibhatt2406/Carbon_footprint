const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results.
 * If errors are found, returns a 400 response with detailed error messages.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Display name must be between 1 and 50 characters'),
  validate
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

const footprintValidator = [
  body('carKm')
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric().withMessage('Car km must be a number')
    .custom(val => Number(val) >= 0).withMessage('Car km cannot be negative'),
  body('bikeKm')
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric().withMessage('Bike km must be a number')
    .custom(val => Number(val) >= 0).withMessage('Bike km cannot be negative'),
  body('busKm')
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric().withMessage('Bus km must be a number')
    .custom(val => Number(val) >= 0).withMessage('Bus km cannot be negative'),
  body('trainKm')
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric().withMessage('Train km must be a number')
    .custom(val => Number(val) >= 0).withMessage('Train km cannot be negative'),
  body('electricityKwh')
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric().withMessage('Electricity kWh must be a number')
    .custom(val => Number(val) >= 0).withMessage('Electricity kWh cannot be negative'),
  body('foodHabit')
    .notEmpty().withMessage('Food habits are required')
    .isString().withMessage('Food habit must be a string'),
  body('shoppingHabit')
    .notEmpty().withMessage('Shopping habits are required')
    .isString().withMessage('Shopping habit must be a string'),
  validate
];

const goalValidator = [
  body('targetValue')
    .notEmpty().withMessage('Target value is required')
    .isNumeric().withMessage('Target value must be a number')
    .custom(val => Number(val) > 0).withMessage('Target value must be greater than zero'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  validate
];

const goalProgressValidator = [
  param('id')
    .notEmpty().withMessage('Goal ID is required'),
  body('currentProgress')
    .notEmpty().withMessage('Current progress is required')
    .isNumeric().withMessage('Current progress must be a number')
    .custom(val => Number(val) >= 0).withMessage('Current progress cannot be negative'),
  validate
];

module.exports = {
  registerValidator,
  loginValidator,
  footprintValidator,
  goalValidator,
  goalProgressValidator
};
