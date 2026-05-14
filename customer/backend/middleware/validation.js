const { body, param, query, validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
}

const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Customer', 'CarrierPartner']).withMessage('Role must be Customer or CarrierPartner'),
  body('companyName').trim().notEmpty().withMessage('Company name is required')
];

const loginRules = [
  body('email').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

const resetPasswordRules = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const createOrderRules = [
  body('pickupLocationId').isInt().withMessage('Pickup location is required'),
  body('deliveryLocationId').isInt().withMessage('Delivery location is required'),
  body('totalWeight').isFloat({ gt: 0 }).withMessage('Weight must be greater than 0')
];

const updateStatusRules = [
  body('status').notEmpty().withMessage('Status is required')
];

const updateProfileRules = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim()
];

const changeRoleRules = [
  body('role').isIn(['Admin', 'Dispatcher', 'Customer', 'CarrierPartner']).withMessage('Invalid role')
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  createOrderRules,
  updateStatusRules,
  updateProfileRules,
  changeRoleRules
};
