const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getAuditLog, getRecentActivity, getSystemStatus,
  getRates, createRate, updateRate, deleteRate,
  getTransportBreakdown
} = require('../controllers/adminController');

// Audit Log
router.get('/audit', authenticate, roleCheck('Admin'), getAuditLog);
router.get('/activity', authenticate, roleCheck('Admin', 'Dispatcher'), getRecentActivity);

// System Status
router.get('/system-status', authenticate, roleCheck('Admin'), getSystemStatus);

// Rates CRUD
router.get('/rates', authenticate, roleCheck('Admin', 'Dispatcher'), getRates);
router.post('/rates', authenticate, roleCheck('Admin'), createRate);
router.put('/rates/:id', authenticate, roleCheck('Admin'), updateRate);
router.delete('/rates/:id', authenticate, roleCheck('Admin'), deleteRate);

// Transport breakdown
router.get('/transport-breakdown', authenticate, roleCheck('Admin', 'Dispatcher'), getTransportBreakdown);

module.exports = router;
