const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { getAllCarriers, getCarrierById, createCarrier, toggleCarrierBlock } = require('../controllers/carrierController');

router.get('/', authenticate, getAllCarriers);
router.get('/:id', authenticate, getCarrierById);
router.post('/', authenticate, roleCheck('Admin'), createCarrier);
router.patch('/:id/block', authenticate, roleCheck('Admin'), toggleCarrierBlock);

module.exports = router;
