const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { validate, createOrderRules } = require('../middleware/validation');
const {
  getMyOrders, getAllOrders, getPendingOrders,
  getOrderById, createOrder, cancelOrder,
  getAvailableCarriers, assignCarrier, getEstimate
} = require('../controllers/orderController');

router.get('/estimate', authenticate, getEstimate);
router.get('/my', authenticate, roleCheck('Customer'), getMyOrders);
router.get('/pending', authenticate, roleCheck('Admin', 'Dispatcher'), getPendingOrders);
router.get('/', authenticate, roleCheck('Admin', 'Dispatcher'), getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, roleCheck('Customer', 'Dispatcher'), createOrderRules, validate, createOrder);
router.put('/:id/cancel', authenticate, cancelOrder);
router.get('/:id/carriers', authenticate, roleCheck('Dispatcher', 'Admin'), getAvailableCarriers);
router.post('/:id/assign-carrier', authenticate, roleCheck('Dispatcher', 'Admin'), assignCarrier);

module.exports = router;
