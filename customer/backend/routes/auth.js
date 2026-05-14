const router = require('express').Router();
const { register, verifyEmail, login, forgotPassword, resetPassword } = require('../controllers/authController');
const { validate, registerRules, loginRules, forgotPasswordRules, resetPasswordRules } = require('../middleware/validation');

router.post('/register', registerRules, validate, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginRules, validate, login);
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, validate, resetPassword);

module.exports = router;
