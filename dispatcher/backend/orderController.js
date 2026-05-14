const supabase = require('../config/supabase');
const { calculateCost, determineTransportMode } = require('../services/costCalculator');
const { createTrackingEvent, createNotification, notifyDispatchers } = require('../services/trackingService');
const { generateOrderNumber, generateShipmentNumber, generateTrackingCode } = require('../utils/generateTrackingCode');
const { logAudit } = require('../services/auditService');

async function getMyOrders(req, res, next) {
  try {
    const { status, startDate, endDate } = req.query;
    let query = supabase
      .from('orders')
      .select(`
        orderid, ordernumber, totalweight, totalpieces, commodity, status, createdat,
        transportmode, estimatedcost, specialinstructions,
        pickup:locations!fk_orders_pickuploc(locationname, city),
        delivery:locations!fk_orders_delivloc(locationname, city),
        shipments(shipmentid, shipmentnumber, status, trackingcode)
      `)
      .eq('customerid', req.user.companyId)
      .order('createdat', { ascending: false });

    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('createdat', startDate);
    if (endDate) query = query.lte('createdat', endDate);

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch orders' });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const { status, startDate, endDate } = req.query;
    let query = supabase
      .from('orders')
      .select(`
        orderid, ordernumber, totalweight, totalpieces, commodity, status, createdat,
        transportmode, estimatedcost, customerid,
        pickup:locations!fk_orders_pickuploc(locationname, city),
        delivery:locations!fk_orders_delivloc(locationname, city),
        shipments(shipmentnumber, status, trackingcode)
      `)
      .order('createdat', { ascending: false });

    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('createdat', startDate);
    if (endDate) query = query.lte('createdat', endDate);

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch orders' });

    // Manually resolve company names
    const companyIds = [...new Set((data || []).map(o => o.customerid).filter(Boolean))];
    const { data: companies } = companyIds.length > 0
      ? await supabase.from('companies').select('companyid, companyname').in('companyid', companyIds)
      : { data: [] };
    const companyMap = Object.fromEntries((companies || []).map(c => [c.companyid, c.companyname]));
    const enriched = (data || []).map(o => ({ ...o, companies: { companyname: companyMap[o.customerid] || null } }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
}

async function getPendingOrders(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        orderid, ordernumber, totalweight, totalpieces, commodity, status, createdat,
        requestedpickupdate, requesteddeliverydate, transportmode, customerid,
        pickup:locations!fk_orders_pickuploc(locationname, city),
        delivery:locations!fk_orders_delivloc(locationname, city)
      `)
      .eq('status', 'Pending')
      .order('createdat', { ascending: false });

    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch pending orders' });

    // Manually resolve company names
    const companyIds = [...new Set((data || []).map(o => o.customerid).filter(Boolean))];
    const { data: companies } = companyIds.length > 0
      ? await supabase.from('companies').select('companyid, companyname').in('companyid', companyIds)
      : { data: [] };
    const companyMap = Object.fromEntries((companies || []).map(c => [c.companyid, c.companyname]));
    const enriched = (data || []).map(o => ({ ...o, companies: { companyname: companyMap[o.customerid] || null } }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    // Base order with only the location joins (these have explicit FK hints and work)
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        pickup:locations!fk_orders_pickuploc(*),
        delivery:locations!fk_orders_delivloc(*)
      `)
      .eq('orderid', parseInt(id))
      .single();

    if (!order || error) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'Customer' && order.customerid !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Fetch related data separately to avoid FK join issues
    const [shipmentsRes, invoicesRes, companyRes] = await Promise.all([
      supabase.from('shipments').select('*').eq('orderid', order.orderid),
      supabase.from('invoices').select('*').eq('orderid', order.orderid),
      order.customerid
        ? supabase.from('companies').select('companyname').eq('companyid', order.customerid).single()
        : { data: null }
    ]);

    order.shipments = shipmentsRes.data || [];
    order.invoices = invoicesRes.data || [];
    order.companies = companyRes.data || { companyname: null };

    // Fetch tracking events and carrier info for each shipment
    if (order.shipments.length > 0) {
      const shipmentIds = order.shipments.map(s => s.shipmentid);
      const carrierIds = [...new Set(order.shipments.map(s => s.primarycarrierid).filter(Boolean))];

      const [eventsRes, partnersRes] = await Promise.all([
        supabase.from('trackingevents').select('*').in('shipmentid', shipmentIds),
        carrierIds.length > 0
          ? supabase.from('partners').select('partnerid, companyname, partnercode, rating').in('partnerid', carrierIds)
          : { data: [] }
      ]);

      const eventsMap = {};
      (eventsRes.data || []).forEach(e => {
        if (!eventsMap[e.shipmentid]) eventsMap[e.shipmentid] = [];
        eventsMap[e.shipmentid].push(e);
      });

      const partnerMap = Object.fromEntries((partnersRes.data || []).map(p => [p.partnerid, p]));

      order.shipments = order.shipments.map(s => ({
        ...s,
        trackingevents: eventsMap[s.shipmentid] || [],
        partners: partnerMap[s.primarycarrierid] || null
      }));
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const {
      pickupLocationId, deliveryLocationId,
      requestedPickupDate, requestedDeliveryDate,
      totalWeight, totalVolume, totalPieces,
      commodity, specialInstructions, items,
      pickupContactName, pickupContactPhone, pickupAddress,
      deliveryContactName, deliveryContactPhone, deliveryAddress
    } = req.body;

    const costEstimate = await calculateCost(pickupLocationId, deliveryLocationId, totalWeight);
    const orderNumber = generateOrderNumber();

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        ordernumber: orderNumber,
        customerid: req.user.companyId,
        pickuplocationid: pickupLocationId,
        deliverylocationid: deliveryLocationId,
        requestedpickupdate: requestedPickupDate || null,
        requesteddeliverydate: requestedDeliveryDate || null,
        totalweight: totalWeight,
        totalvolume: totalVolume || null,
        totalpieces: totalPieces || 1,
        commodity: commodity || null,
        specialinstructions: specialInstructions || null,
        status: 'Pending',
        createdby: req.user.id,
        transportmode: costEstimate.transportMode,
        estimatedcost: costEstimate.total,
        pickupcontactname: pickupContactName || null,
        pickupcontactphone: pickupContactPhone || null,
        pickupaddress: pickupAddress || null,
        deliverycontactname: deliveryContactName || null,
        deliverycontactphone: deliveryContactPhone || null,
        deliveryaddress: deliveryAddress || null
      })
      .select()
      .single();

    if (error) {
      console.error('Order creation error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }

    if (items && items.length > 0) {
      const orderItems = items.map((item) => ({
        orderid: order.orderid,
        itemname: item.itemName,
        description: item.description || null,
        quantity: item.quantity || 1,
        weight: item.weight || null,
        length: item.length || null,
        width: item.width || null,
        height: item.height || null,
        packagingtype: item.packagingType || null
      }));
      await supabase.from('orderitems').insert(orderItems);
    }

    await notifyDispatchers(
      'New Order Created',
      `Order ${orderNumber} requires assignment`,
      'Order',
      order.orderid
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { ...order, costEstimate }
    });
  } catch (err) {
    next(err);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;

    const { data: order } = await supabase
      .from('orders')
      .select('orderid, status, customerid')
      .eq('orderid', parseInt(id))
      .single();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'Customer' && order.customerid !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled', updatedat: new Date().toISOString() })
      .eq('orderid', parseInt(id));

    if (error) return res.status(500).json({ success: false, message: 'Failed to cancel order' });

    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) {
    next(err);
  }
}

async function getAvailableCarriers(req, res, next) {
  try {
    const { id } = req.params;

    const { data: order } = await supabase
      .from('orders')
      .select('orderid, pickuplocationid, deliverylocationid, totalweight')
      .eq('orderid', parseInt(id))
      .single();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const transportMode = determineTransportMode(order.totalweight);

    const { data: rates, error } = await supabase
      .from('rates')
      .select('*')
      .eq('originlocationid', order.pickuplocationid)
      .eq('destinationlocationid', order.deliverylocationid)
      .eq('transportmode', transportMode)
      .eq('isactive', true)
      .lte('minweight', order.totalweight);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch carriers' });
    }

    // Manually resolve partners and currencies
    const partnerIds = [...new Set((rates || []).map(r => r.partnerid).filter(Boolean))];
    const currencyIds = [...new Set((rates || []).map(r => r.currencyid).filter(Boolean))];

    const { data: partners } = partnerIds.length > 0
      ? await supabase.from('partners').select('partnerid, partnercode, companyname, rating, totalshipments, ontimedeliveries, status, servicetype').in('partnerid', partnerIds)
      : { data: [] };
    const partnerMap = Object.fromEntries((partners || []).map(p => [p.partnerid, p]));

    const { data: currencies } = currencyIds.length > 0
      ? await supabase.from('currencies').select('currencyid, currencycode, symbol').in('currencyid', currencyIds)
      : { data: [] };
    const currencyMap = Object.fromEntries((currencies || []).map(c => [c.currencyid, c]));

    const today = new Date().toISOString().slice(0, 10);
    const validRates = (rates || []).filter((r) => {
      const partner = partnerMap[r.partnerid];
      if (!partner || partner.status !== 'Active') return false;
      if (r.maxweight && order.totalweight > r.maxweight) return false;
      if (r.effectivefrom && today < r.effectivefrom) return false;
      if (r.effectiveto && today > r.effectiveto) return false;
      return true;
    });

    const carriers = validRates.map((r) => {
      const partner = partnerMap[r.partnerid];
      const currency = currencyMap[r.currencyid];
      const weightCharge = order.totalweight * Number(r.rateperkg);
      const total = Number(r.baserate) + weightCharge + Number(r.fuelsurcharge);
      const onTimePercent = partner.totalshipments > 0
        ? Math.round((partner.ontimedeliveries / partner.totalshipments) * 100)
        : 0;

      return {
        partnerId: partner.partnerid,
        companyName: partner.companyname,
        partnerCode: partner.partnercode,
        serviceType: partner.servicetype,
        rating: partner.rating,
        totalShipments: partner.totalshipments,
        onTimePercent,
        transportMode: r.transportmode,
        ratePerKg: r.rateperkg,
        baseRate: r.baserate,
        fuelSurcharge: r.fuelsurcharge,
        weightCharge,
        total,
        transitDays: r.transitdays,
        currency: currency?.currencycode || 'PKR',
        rateId: r.rateid
      };
    });

    res.json({ success: true, data: carriers });
  } catch (err) {
    next(err);
  }
}

async function assignCarrier(req, res, next) {
  try {
    const { id } = req.params;
    const { partnerId, rateId } = req.body;

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('orderid', parseInt(id))
      .single();

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Order is not in Pending status' });
    }

    const costEstimate = await calculateCost(order.pickuplocationid, order.deliverylocationid, order.totalweight);

    const shipmentNumber = generateShipmentNumber();
    const trackingCode = generateTrackingCode();

    const { data: rate } = await supabase
      .from('rates')
      .select('currencyid, transitdays')
      .eq('rateid', rateId)
      .single();

    const estimatedDelivery = rate?.transitdays
      ? new Date(Date.now() + rate.transitdays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: shipment, error: shipError } = await supabase
      .from('shipments')
      .insert({
        shipmentnumber: shipmentNumber,
        orderid: order.orderid,
        primarycarrierid: partnerId,
        scheduledpickup: order.requestedpickupdate,
        estimateddelivery: estimatedDelivery,
        totalcost: costEstimate.total,
        currencyid: rate?.currencyid || null,
        revenue: costEstimate.total,
        trackingcode: trackingCode,
        status: 'Assigned',
        dispatcherid: req.user.id
      })
      .select()
      .single();

    if (shipError) {
      console.error('Shipment creation error:', shipError);
      return res.status(500).json({ success: false, message: 'Failed to create shipment' });
    }

    await supabase
      .from('orders')
      .update({ status: 'Assigned', updatedat: new Date().toISOString() })
      .eq('orderid', order.orderid);

    await createTrackingEvent(
      shipment.shipmentid,
      'Status Change',
      'Shipment assigned to carrier',
      order.pickuplocationid
    );

    const { data: orderUser } = await supabase
      .from('users')
      .select('userid')
      .eq('companyid', order.customerid)
      .limit(1)
      .single();

    if (orderUser) {
      await createNotification(
        orderUser.userid,
        'Order Confirmed',
        `Your order ${order.ordernumber} has been assigned to a carrier. Tracking code: ${trackingCode}`,
        'Success',
        'Shipment',
        shipment.shipmentid
      );
    }

    res.json({
      success: true,
      message: 'Carrier assigned successfully',
      data: { shipment, trackingCode }
    });

    await logAudit(req.user.id, 'Carrier Assigned', 'Order', parseInt(id), { carrierId, trackingCode }, req.ip);
  } catch (err) {
    next(err);
  }
}

async function getEstimate(req, res, next) {
  try {
    const { pickupLocationId, deliveryLocationId, weight } = req.query;
    if (!pickupLocationId || !deliveryLocationId || !weight) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    const estimate = await calculateCost(
      parseInt(pickupLocationId),
      parseInt(deliveryLocationId),
      parseFloat(weight)
    );
    res.json({ success: true, data: estimate });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyOrders, getAllOrders, getPendingOrders,
  getOrderById, createOrder, cancelOrder,
  getAvailableCarriers, assignCarrier, getEstimate
};
