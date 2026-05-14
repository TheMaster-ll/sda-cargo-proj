const supabase = require('../config/supabase');

async function getAllCarriers(req, res, next) {
  try {
    const { data: partners, error } = await supabase
      .from('partners')
      .select('*')
      .order('companyname');

    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch carriers' });

    const formatted = partners.map((p) => ({
      ...p,
      onTimePercent: p.totalshipments > 0
        ? Math.round((p.ontimedeliveries / p.totalshipments) * 100)
        : 0
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

async function getCarrierById(req, res, next) {
  try {
    const { id } = req.params;

    const [partnerRes, shipmentsRes, ratingsRes, ratesRes] = await Promise.all([
      supabase
        .from('partners')
        .select(`
          *,
          partnercontacts(*),
          equipment(*)
        `)
        .eq('partnerid', parseInt(id))
        .single(),
      supabase
        .from('shipments')
        .select(`
          shipmentid, shipmentnumber, status, createdat, estimateddelivery, actualdelivery, isdelayed,
          orders(ordernumber, totalweight, transportmode,
            pickup:locations!fk_orders_pickuploc(locationname, city),
            delivery:locations!fk_orders_delivloc(locationname, city)
          )
        `)
        .eq('primarycarrierid', parseInt(id))
        .order('createdat', { ascending: false })
        .limit(20),
      supabase
        .from('ratings')
        .select('rating, comment, ratertype, createdat, users(firstname, lastname)')
        .eq('partnerid', parseInt(id))
        .order('createdat', { ascending: false })
        .limit(10),
      supabase
        .from('rates')
        .select(`
          rateid, transportmode, baserate, rateperkg, fuelsurcharge, minweight, maxweight, transitdays, isactive,
          origin:locations!fk_rates_originloc(locationname, city),
          destination:locations!fk_rates_destloc(locationname, city)
        `)
        .eq('partnerid', parseInt(id))
        .eq('isactive', true)
    ]);

    const partner = partnerRes.data;
    if (!partner || partnerRes.error) {
      return res.status(404).json({ success: false, message: 'Carrier not found' });
    }

    partner.onTimePercent = partner.totalshipments > 0
      ? Math.round((partner.ontimedeliveries / partner.totalshipments) * 100)
      : 0;

    // Build route summary from shipments
    const routeMap = {};
    (shipmentsRes.data || []).forEach(s => {
      const from = s.orders?.pickup?.city || 'Unknown';
      const to = s.orders?.delivery?.city || 'Unknown';
      const key = `${from} → ${to}`;
      if (!routeMap[key]) routeMap[key] = { route: key, count: 0, modes: new Set() };
      routeMap[key].count += 1;
      if (s.orders?.transportmode) routeMap[key].modes.add(s.orders.transportmode);
    });

    partner.recentShipments = shipmentsRes.data || [];
    partner.routes = Object.values(routeMap).map(r => ({ ...r, modes: [...r.modes] })).sort((a, b) => b.count - a.count);
    partner.recentRatings = ratingsRes.data || [];
    partner.configuredRates = (ratesRes.data || []).map(r => ({
      ...r,
      routeLabel: `${r.origin?.city || '?'} → ${r.destination?.city || '?'}`,
      originName: r.origin?.locationname,
      destinationName: r.destination?.locationname
    }));

    res.json({ success: true, data: partner });
  } catch (err) {
    next(err);
  }
}

async function createCarrier(req, res, next) {
  try {
    const { partnerCode, companyName, contactPerson, phone, email, serviceType } = req.body;

    const { data, error } = await supabase
      .from('partners')
      .insert({
        partnercode: partnerCode,
        companyname: companyName,
        contactperson: contactPerson || null,
        phone: phone || null,
        email: email || null,
        servicetype: serviceType || null,
        status: 'Active'
      })
      .select()
      .single();

    if (error) {
      console.error('Create carrier error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create carrier' });
    }

    res.status(201).json({ success: true, message: 'Carrier created', data });
  } catch (err) {
    next(err);
  }
}

async function toggleCarrierBlock(req, res, next) {
  try {
    const { id } = req.params;

    const { data: partner } = await supabase
      .from('partners')
      .select('partnerid, status')
      .eq('partnerid', parseInt(id))
      .single();

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Carrier not found' });
    }

    const newStatus = partner.status === 'Active' ? 'Suspended' : 'Active';

    const { error } = await supabase
      .from('partners')
      .update({ status: newStatus })
      .eq('partnerid', parseInt(id));

    if (error) return res.status(500).json({ success: false, message: 'Failed to update carrier status' });

    res.json({ success: true, message: `Carrier ${newStatus === 'Active' ? 'unblocked' : 'blocked'}` });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllCarriers, getCarrierById, createCarrier, toggleCarrierBlock };
