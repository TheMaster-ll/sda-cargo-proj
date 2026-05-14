const supabase = require('../config/supabase');

// Submit a rating for a shipment's carrier
async function submitRating(req, res, next) {
  try {
    const { shipmentId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Get the shipment and verify it's delivered
    const { data: shipment, error: shipErr } = await supabase
      .from('shipments')
      .select('shipmentid, primarycarrierid, status, orderid')
      .eq('shipmentid', parseInt(shipmentId))
      .single();

    if (!shipment || shipErr) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (shipment.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Can only rate delivered shipments' });
    }

    const raterType = role === 'Customer' ? 'Customer' : 'Dispatcher';

    // For customers, verify they own the order
    if (role === 'Customer') {
      const { data: order } = await supabase
        .from('orders')
        .select('customerid')
        .eq('orderid', shipment.orderid)
        .single();

      const { data: usr } = await supabase
        .from('users')
        .select('companyid')
        .eq('userid', userId)
        .single();

      if (!order || !usr || usr.companyid !== order.customerid) {
        return res.status(403).json({ success: false, message: 'Not authorized to rate this shipment' });
      }
    }

    // Check for existing rating
    const { data: existing } = await supabase
      .from('ratings')
      .select('ratingid')
      .eq('shipmentid', shipmentId)
      .eq('userid', userId)
      .single();

    if (existing) {
      // Update existing rating
      const { error: updateErr } = await supabase
        .from('ratings')
        .update({ rating, comment, createdat: new Date().toISOString() })
        .eq('ratingid', existing.ratingid);

      if (updateErr) {
        return res.status(500).json({ success: false, message: 'Failed to update rating' });
      }
    } else {
      // Insert new rating
      const { error: insertErr } = await supabase
        .from('ratings')
        .insert({
          shipmentid: parseInt(shipmentId),
          partnerid: shipment.primarycarrierid,
          userid: userId,
          ratertype: raterType,
          rating,
          comment: comment || null
        });

      if (insertErr) {
        console.error('Rating insert error:', insertErr);
        return res.status(500).json({ success: false, message: 'Failed to submit rating' });
      }
    }

    // Update the partner's average rating
    await updatePartnerRating(shipment.primarycarrierid);

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (err) {
    next(err);
  }
}

// Get ratings for a shipment
async function getShipmentRatings(req, res, next) {
  try {
    const { shipmentId } = req.params;

    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('ratingid, rating, comment, ratertype, createdat, users(firstname, lastname)')
      .eq('shipmentid', shipmentId)
      .order('createdat', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch ratings' });
    }

    res.json({ success: true, data: ratings || [] });
  } catch (err) {
    next(err);
  }
}

// Recalculate and update a partner's average rating
async function updatePartnerRating(partnerId) {
  const { data: ratings } = await supabase
    .from('ratings')
    .select('rating')
    .eq('partnerid', partnerId);

  if (ratings && ratings.length > 0) {
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    await supabase
      .from('partners')
      .update({ rating: Math.round(avg * 10) / 10 })
      .eq('partnerid', partnerId);
  }
}

module.exports = { submitRating, getShipmentRatings };
