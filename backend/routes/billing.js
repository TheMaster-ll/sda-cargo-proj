const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { getMyInvoices, getAllInvoices, getInvoiceByShipment, generateInvoice, markAsPaid } = require('../controllers/billingController');

router.get('/my', authenticate, roleCheck('Customer'), getMyInvoices);
router.get('/', authenticate, roleCheck('Admin', 'Dispatcher'), getAllInvoices);
router.get('/shipment/:shipmentId', authenticate, getInvoiceByShipment);
router.post('/:shipmentId/generate', authenticate, roleCheck('Admin', 'Dispatcher'), generateInvoice);
router.put('/:id/pay', authenticate, roleCheck('Admin', 'Customer'), markAsPaid);

module.exports = router;
