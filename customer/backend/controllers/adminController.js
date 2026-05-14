const supabase = require('../config/supabase');

// ─── Audit Log ───
async function getAuditLog(req, res, next) {
  try {
    const { action, userId, entityType, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('auditlog')
      .select('logid, action, entitytype, entityid, details, ipaddress, createdat, users(firstname, lastname, email)', { count: 'exact' })
      .order('createdat', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (action) query = query.eq('action', action);
    if (userId) query = query.eq('userid', parseInt(userId));
    if (entityType) query = query.eq('entitytype', entityType);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch audit log' });

    res.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getRecentActivity(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('auditlog')
      .select('logid, action, entitytype, entityid, details, createdat, users(firstname, lastname)')
      .order('createdat', { ascending: false })
      .limit(10);

    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch activity' });
    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
}

// ─── System Status ───
async function getSystemStatus(req, res, next) {
  try {
    const [users, orders, shipments, invoices, partners, locations, rates, notifications] = await Promise.all([
      supabase.from('users').select('userid, isactive, usertypeid, lastlogin, createdat', { count: 'exact' }),
      supabase.from('orders').select('orderid, status, createdat', { count: 'exact' }),
      supabase.from('shipments').select('shipmentid, status, isdelayed, createdat', { count: 'exact' }),
      supabase.from('invoices').select('invoiceid, status, total', { count: 'exact' }),
      supabase.from('partners').select('partnerid, status', { count: 'exact' }),
      supabase.from('locations').select('locationid', { count: 'exact' }),
      supabase.from('rates').select('rateid', { count: 'exact' }),
      supabase.from('notifications').select('notificationid, isread', { count: 'exact' })
    ]);

    const allUsers = users.data || [];
    const allOrders = orders.data || [];
    const allShipments = shipments.data || [];
    const allInvoices = invoices.data || [];

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const last24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Users by role
    const roleBreakdown = {};
    allUsers.forEach((u) => {
      const role = u.usertypeid;
      roleBreakdown[role] = (roleBreakdown[role] || 0) + 1;
    });

    // Recent logins (last 24h)
    const recentLogins = allUsers.filter((u) => u.lastlogin && u.lastlogin >= last24h).length;

    // Orders by status
    const ordersByStatus = {};
    allOrders.forEach((o) => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    // Shipments by status
    const shipmentsByStatus = {};
    allShipments.forEach((s) => {
      shipmentsByStatus[s.status] = (shipmentsByStatus[s.status] || 0) + 1;
    });

    // Revenue
    const totalRevenue = allInvoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + Number(i.total), 0);
    const pendingRevenue = allInvoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + Number(i.total), 0);

    // New records this week
    const newOrdersThisWeek = allOrders.filter((o) => o.createdat >= last7d).length;
    const newUsersThisWeek = allUsers.filter((u) => u.createdat >= last7d).length;
    const newShipmentsThisWeek = allShipments.filter((s) => s.createdat >= last7d).length;

    res.json({
      success: true,
      data: {
        database: {
          users: users.count || 0,
          orders: orders.count || 0,
          shipments: shipments.count || 0,
          invoices: invoices.count || 0,
          partners: partners.count || 0,
          locations: locations.count || 0,
          rates: rates.count || 0,
          notifications: notifications.count || 0
        },
        users: {
          total: allUsers.length,
          active: allUsers.filter((u) => u.isactive).length,
          inactive: allUsers.filter((u) => !u.isactive).length,
          recentLogins,
          newThisWeek: newUsersThisWeek,
          roleBreakdown
        },
        orders: {
          total: allOrders.length,
          byStatus: ordersByStatus,
          newThisWeek: newOrdersThisWeek
        },
        shipments: {
          total: allShipments.length,
          byStatus: shipmentsByStatus,
          delayed: allShipments.filter((s) => s.isdelayed).length,
          newThisWeek: newShipmentsThisWeek
        },
        financials: {
          totalRevenue,
          pendingRevenue,
          totalInvoices: allInvoices.length,
          paidInvoices: allInvoices.filter((i) => i.status === 'Paid').length,
          pendingInvoices: allInvoices.filter((i) => i.status === 'Pending').length
        },
        carriers: {
          total: (partners.data || []).length,
          active: (partners.data || []).filter((p) => p.status === 'Active').length,
          inactive: (partners.data || []).filter((p) => p.status !== 'Active').length
        },
        api: {
          status: 'Operational',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

// ─── Rates CRUD ───
async function getRates(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('rates')
      .select(`
        rateid, transportmode, baserate, rateperkg, fuelsurcharge,
        minweight, maxweight, transitdays, effectivefrom, effectiveto, isactive,
        origin:locations!fk_rates_originloc(locationid, locationname, city),
        destination:locations!fk_rates_destloc(locationid, locationname, city)
      `)
      .order('rateid', { ascending: true });

    if (error) {
      console.error('Rates fetch error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch rates' });
    }
    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
}

async function createRate(req, res, next) {
  try {
    const { originLocationId, destinationLocationId, transportMode, baseRate, ratePerKg, fuelSurcharge, minWeight, maxWeight, transitDays, effectiveFrom, effectiveTo, currencyId } = req.body;

    const { data, error } = await supabase
      .from('rates')
      .insert({
        originlocationid: originLocationId,
        destinationlocationid: destinationLocationId,
        transportmode: transportMode,
        baserate: baseRate,
        rateperkg: ratePerKg,
        fuelsurcharge: fuelSurcharge || 0,
        minweight: minWeight || 0,
        maxweight: maxWeight || null,
        transitdays: transitDays || null,
        effectivefrom: effectiveFrom || new Date().toISOString().slice(0, 10),
        effectiveto: effectiveTo || null,
        currencyid: currencyId || 2,
        isactive: true
      })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, message: error.message || 'Failed to create rate' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateRate(req, res, next) {
  try {
    const { id } = req.params;
    const updates = {};
    const fields = ['baserate', 'rateperkg', 'fuelsurcharge', 'minweight', 'maxweight', 'transitdays', 'effectivefrom', 'effectiveto', 'isactive', 'transportmode'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const { error } = await supabase.from('rates').update(updates).eq('rateid', parseInt(id));
    if (error) return res.status(500).json({ success: false, message: 'Failed to update rate' });
    res.json({ success: true, message: 'Rate updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteRate(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('rates').delete().eq('rateid', parseInt(id));
    if (error) return res.status(500).json({ success: false, message: 'Failed to delete rate' });
    res.json({ success: true, message: 'Rate deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── Transport Mode Breakdown (for dashboard pie chart) ───
async function getTransportBreakdown(req, res, next) {
  try {
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('shipmentid, orders(totalweight)');

    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch data' });

    const breakdown = { Air: 0, Road: 0, Sea: 0 };
    (shipments || []).forEach((s) => {
      const weight = Number(s.orders?.totalweight || 0);
      if (weight < 500) breakdown.Air += 1;
      else if (weight <= 5000) breakdown.Road += 1;
      else breakdown.Sea += 1;
    });

    const result = Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAuditLog, getRecentActivity, getSystemStatus, getRates, createRate, updateRate, deleteRate, getTransportBreakdown };
