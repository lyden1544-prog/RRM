
import { validationResult, body } from 'express-validator';
import logger from './logger.js';

export const getValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));
  }
  return null;
};

export const validateEmail = () => {
  return body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address');
};

export const validatePassword = () => {
  return body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain uppercase, number, and special char');
};

export const validators = {
  email: validateEmail(),
  password: validatePassword(),
  
  createUser: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('company_name').trim().notEmpty(),
    body('full_name').trim().notEmpty(),
  ],

  loginUser: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],

  createDevice: [
    body('device_name').trim().notEmpty(),
    body('device_type').isIn(['windows', 'mac', 'linux']),
    body('hostname').trim().notEmpty(),
  ],

  createTicket: [
    body('title').trim().notEmpty().isLength({ min: 5 }),
    body('description').trim().notEmpty().isLength({ min: 10 }),
    body('priority').isIn(['low', 'medium', 'high', 'critical']),
  ],
};

export const handleValidationErrors = (req, res, next) => {
  const errors = getValidationErrors(req);
  if (errors) {
    logger.warn('Validation errors:', errors);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export default {
  getValidationErrors,
  validateEmail,
  validatePassword,
  validators,
  handleValidationErrors,
};