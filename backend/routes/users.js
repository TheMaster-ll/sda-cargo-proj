const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { validate, updateProfileRules, changeRoleRules } = require('../middleware/validation');
const { getMe, updateMe, changePassword, getAllUsers, changeRole, toggleStatus, inviteUser, acceptInvite, resendInvite } = require('../controllers/userController');

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfileRules, validate, updateMe);
router.put('/me/password', authenticate, changePassword);
router.get('/', authenticate, roleCheck('Admin'), getAllUsers);
router.patch('/:id/role', authenticate, roleCheck('Admin'), changeRoleRules, validate, changeRole);
router.patch('/:id/status', authenticate, roleCheck('Admin'), toggleStatus);

// Invite flow
router.post('/invite', authenticate, roleCheck('Admin'), inviteUser);
router.post('/accept-invite/:token', acceptInvite);
router.post('/:id/resend-invite', authenticate, roleCheck('Admin'), resendInvite);

module.exports = router;
