const supabase = require('../config/supabase');
const { createTrackingEvent, createNotification, notifyDispatchers } = require('../services/trackingService');
const { logAudit } = require('../services/auditService');

const VALID_TRANSITIONS = {
  'Assigned': ['Picked Up', 'PickedUp'],
  'Picked Up': ['In Transit', 'InTransit'],
  'PickedUp': ['In Transit', 'InTransit'],
  'In Transit': ['Delivered'],
  'InTransit': ['Delivered']
};

// Helper: enrich shipments with company names and partner info
async function enrichShipments(shipments) {
  if (!shipments || shipments.length === 0) return shipments;
  const list = Array.isArray(shipments) ? shipments : [shipments];

  // Collect IDs
  const customerIds = new Set();
  const partnerIds = new Set();
  list.forEach(s => {
    if (s.orders) {
      const o = Array.isArray(s.orders) ? s.orders : [s.orders];
      o.forEach(ord => { if (ord.customerid) customerIds.add(ord.customerid); });
    }
    if (s.primarycarrierid) partnerIds.add(s.primarycarrierid);
  });

  const { data: companies } = customerIds.size > 0
    ? await supabase.from('companies').select('companyid, companyname').in('companyid', [...customerIds])
    : { data: [] };
  const companyMap = Object.fromEntries((companies || []).map(c => [c.companyid, c.companyname]));

  const { data: partners } = partnerIds.size > 0
    ? await supabase.from('partners').select('*').in('partnerid', [...partnerIds])
    : { data: [] };
  const partnerMap = Object.fromEntries((partners || []).map(p => [p.partnerid, p]));

  list.forEach(s => {
    if (s.orders) {
      const isArr = Array.isArray(s.orders);
      const orders = isArr ? s.orders : [s.orders];
      orders.forEach(o => { o.companies = { companyname: companyMap[o.customerid] || null }; });
      if (!isArr) s.orders = orders[0];
    }
    s.partners = partnerMap[s.primarycarrierid] || null;
  });

  return Array.isArray(shipments) ? list : list[0];
}

async function getAllShipments(req, res, next) {
  try {
    const { status, carrier, startDate, endDate } = req.query;
    let query = supabase
      .from('shipments')
      .select(`
        shipmentid, shipmentnumber, trackingcode, status, isdelayed,
        scheduledpickup, actualpickup, estimateddelivery, actualdelivery,
        totalcost, createdat, primarycarrierid,
        orders!inner(orderid, ordernumber, totalweight, totalpieces, customerid,
          pickup:locations!fk_orders_pickuploc(city),
          delivery:locations!fk_orders_delivloc(city)
        )
      `)
      .order('createdat', { ascending: false });

    if (status) query = query.eq('status', status);
    if (carrier) query = query.eq('primarycarrierid', parseInt(carrier));
    if (startDate) query = query.gte('createdat', startDate);
    if (endDate) query = query.lte('createdat', endDate);

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch shipments' });

    await enrichShipments(data || []);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getMyShipments(req, res, next) {
  try {
    const { status } = req.query;

    // companyid on the user maps directly to partnerid in partners table
    const partnerId = req.user.companyId;

    if (!partnerId) {
      return res.json({ success: true, data: [] });
    }

    let query = supabase
      .from('shipments')
      .select(`
        shipmentid, shipmentnumber, trackingcode, status, isdelayed,
        scheduledpickup, actualpickup, estimateddelivery, actualdelivery,
        totalcost, createdat, primarycarrierid,
        orders(orderid, ordernumber, totalweight, totalpieces, commodity, customerid,
          pickup:locations!fk_orders_pickuploc(city, locationname),
          delivery:locations!fk_orders_delivloc(city, locationname)
        )
      `)
      .eq('primarycarrierid', partnerId)
      .order('createdat', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch shipments' });

    await enrichShipments(data || []);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getShipmentById(req, res, next) {
  try {
    const { id } = req.params;

    const { data: shipment, error } = await supabase
      .from('shipments')
      .select(`
        *,
        orders(
          *,
          pickup:locations!fk_orders_pickuploc(*),
          delivery:locations!fk_orders_delivloc(*),
          orderitems(*)
        ),
        trackingevents(*)
      `)
      .eq('shipmentid', parseInt(id))
      .single();

    if (!shipment || error) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    await enrichShipments(shipment);

    if (shipment.trackingevents) {
      shipment.trackingevents.sort((a, b) => new Date(b.eventtime) - new Date(a.eventtime));
    }

    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
}

async function updateShipmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const { data: shipment } = await supabase
      .from('shipments')
      .select('*, orders(orderid, customerid, pickuplocationid, deliverylocationid)')
      .eq('shipmentid', parseInt(id))
      .single();

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const allowed = VALID_TRANSITIONS[shipment.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${shipment.status}" to "${status}"`
      });
    }

    const updates = { status, updatedat: new Date().toISOString() };

    const normalizedStatus = status.replace(/\s/g, '');
    if (normalizedStatus === 'PickedUp' || status === 'Picked Up') {
      updates.actualpickup = new Date().toISOString();
    }
    if (status === 'Delivered') {
      updates.actualdelivery = new Date().toISOString();
    }

    const { error } = await supabase
      .from('shipments')
      .update(updates)
      .eq('shipmentid', parseInt(id));

    if (error) return res.status(500).json({ success: false, message: 'Failed to update status' });

    const locationId = status === 'Delivered'
      ? shipment.orders?.deliverylocationid
      : shipment.orders?.pickuplocationid;

    await createTrackingEvent(
      shipment.shipmentid,
      'Status Change',
      note || `Shipment status updated to ${status}`,
      locationId
    );

    if (status === 'Delivered') {
      await supabase
        .from('orders')
        .update({ status: 'Completed', updatedat: new Date().toISOString() })
        .eq('orderid', shipment.orders.orderid);
    }

    const { data: customerUser } = await supabase
      .from('users')
      .select('userid')
      .eq('companyid', shipment.orders?.customerid)
      .limit(1)
      .single();

    if (customerUser) {
      await createNotification(
        customerUser.userid,
        'Shipment Update',
        `Shipment ${shipment.shipmentnumber} is now "${status}"`,
        status === 'Delivered' ? 'Success' : 'Info',
        'Shipment',
        shipment.shipmentid
      );
    }

    await logAudit(req.user.id, 'Shipment Status Update', 'Shipment', parseInt(id), { from: shipment.status, to: status }, req.ip);
    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    next(err);
  }
}

async function trackByCode(req, res, next) {
  try {
    const { trackingCode } = req.params;

    // First, simple lookup to confirm the shipment exists
    const { data: basic, error: basicError } = await supabase
      .from('shipments')
      .select('shipmentid, shipmentnumber, trackingcode, status')
      .ilike('trackingcode', trackingCode)
      .single();

    if (!basic || basicError) {
      return res.status(404).json({ success: false, message: 'Shipment not found', debug: basicError?.message });
    }

    // Build shipment from simple queries to avoid join issues
    const { data: shipment, error } = await supabase
      .from('shipments')
      .select('shipmentid, shipmentnumber, trackingcode, status, isdelayed, primarycarrierid, orderid, scheduledpickup, actualpickup, estimateddelivery, actualdelivery')
      .eq('shipmentid', basic.shipmentid)
      .single();

    if (!shipment || error) {
      return res.status(404).json({ success: false, message: 'Shipment query failed', debug: error?.message });
    }

    // Fetch order separately
    if (shipment.orderid) {
      const { data: order } = await supabase
        .from('orders')
        .select('ordernumber, totalweight, totalpieces, commodity, pickuplocationid, deliverylocationid')
        .eq('orderid', shipment.orderid)
        .single();
      if (order) {
        const [pickup, delivery] = await Promise.all([
          order.pickuplocationid ? supabase.from('locations').select('city, locationname').eq('locationid', order.pickuplocationid).single() : { data: null },
          order.deliverylocationid ? supabase.from('locations').select('city, locationname').eq('locationid', order.deliverylocationid).single() : { data: null }
        ]);
        order.pickup = pickup.data;
        order.delivery = delivery.data;
        shipment.orders = order;
      }
    }

    // Fetch carrier separately
    if (shipment.primarycarrierid) {
      const { data: partner } = await supabase.from('partners').select('companyname').eq('partnerid', shipment.primarycarrierid).single();
      shipment.partners = partner || null;
    }

    // Fetch tracking events separately
    const { data: events } = await supabase
      .from('trackingevents')
      .select('eventid, eventtype, description, eventtime, locationid, iscustomervisible')
      .eq('shipmentid', basic.shipmentid);
    shipment.trackingevents = events || [];

    if (shipment.trackingevents) {
      shipment.trackingevents = shipment.trackingevents
        .filter((e) => e.iscustomervisible)
        .sort((a, b) => new Date(b.eventtime) - new Date(a.eventtime));
    }

    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
}

async function addCheckpoint(req, res, next) {
  try {
    const { id } = req.params;
    const { description, locationId } = req.body;

    if (!description) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const { data: shipment } = await supabase
      .from('shipments')
      .select('shipmentid, shipmentnumber, primarycarrierid, status, orders(customerid)')
      .eq('shipmentid', parseInt(id))
      .single();

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    // Only allow checkpoints for active shipments
    if (['Delivered', 'Cancelled'].includes(shipment.status)) {
      return res.status(400).json({ success: false, message: 'Cannot add updates to completed shipments' });
    }

    await createTrackingEvent(
      shipment.shipmentid,
      'Checkpoint',
      description,
      locationId ? parseInt(locationId) : null,
      true
    );

    // Notify dispatchers
    await notifyDispatchers(
      'Carrier Update',
      `${shipment.shipmentnumber}: ${description}`,
      'Shipment',
      shipment.shipmentid
    );

    // Notify customer
    const { data: customerUser } = await supabase
      .from('users')
      .select('userid')
      .eq('companyid', shipment.orders?.customerid)
      .limit(1)
      .single();

    if (customerUser) {
      await createNotification(
        customerUser.userid,
        'Shipment Update',
        `${shipment.shipmentnumber}: ${description}`,
        'Info',
        'Shipment',
        shipment.shipmentid
      );
    }

    res.json({ success: true, message: 'Checkpoint added successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllShipments, getMyShipments, getShipmentById, updateShipmentStatus, trackByCode, addCheckpoint };
