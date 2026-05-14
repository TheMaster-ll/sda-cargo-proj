const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { validate, updateStatusRules } = require('../middleware/validation');
const {
  getAllShipments, getMyShipments, getShipmentById,
  updateShipmentStatus, trackByCode, addCheckpoint
} = require('../controllers/shipmentController');

router.get('/track/:trackingCode', trackByCode);
router.get('/my', authenticate, roleCheck('CarrierPartner'), getMyShipments);
router.get('/', authenticate, roleCheck('Admin', 'Dispatcher'), getAllShipments);
router.get('/:id', authenticate, getShipmentById);
router.put('/:id/status', authenticate, roleCheck('Dispatcher', 'CarrierPartner'), updateStatusRules, validate, updateShipmentStatus);
router.post('/:id/checkpoint', authenticate, roleCheck('CarrierPartner'), addCheckpoint);

module.exports = router;
