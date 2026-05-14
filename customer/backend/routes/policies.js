const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { getSections, updateSection, addSection, deleteSection } = require('../controllers/policyController');

// Public — anyone can read policies
router.get('/:type', getSections);

// Admin only — modify policies
router.post('/:type', authenticate, roleCheck('Admin'), addSection);
router.put('/:type/:id', authenticate, roleCheck('Admin'), updateSection);
router.delete('/:type/:id', authenticate, roleCheck('Admin'), deleteSection);

module.exports = router;
