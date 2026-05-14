const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { getDashboard, getShipmentVolume, getTopRoutes, getCarrierPerformance } = require('../controllers/analyticsController');

router.get('/dashboard', authenticate, roleCheck('Admin', 'Dispatcher'), getDashboard);
router.get('/shipment-volume', authenticate, roleCheck('Admin', 'Dispatcher'), getShipmentVolume);
router.get('/routes', authenticate, roleCheck('Admin', 'Dispatcher'), getTopRoutes);
router.get('/carrier-performance', authenticate, roleCheck('Admin', 'Dispatcher'), getCarrierPerformance);

module.exports = router;
