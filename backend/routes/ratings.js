const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { submitRating, getShipmentRatings } = require('../controllers/ratingController');

router.post('/:shipmentId', authenticate, roleCheck('Customer', 'Dispatcher'), submitRating);
router.get('/:shipmentId', authenticate, getShipmentRatings);

module.exports = router;
