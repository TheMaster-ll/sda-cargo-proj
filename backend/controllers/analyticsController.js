const supabase = require('../config/supabase');

async function getDashboard(req, res, next) {
  try {
    const [orders, shipments, invoices, carriers, users] = await Promise.all([
      supabase.from('orders').select('orderid, status'),
      supabase.from('shipments').select('shipmentid, status, isdelayed'),
      supabase.from('invoices').select('invoiceid, total, status, duedate'),
      supabase.from('partners').select('partnerid, status'),
      supabase.from('users').select('userid, isactive')
    ]);

    const allOrders = orders.data || [];
    const allShipments = shipments.data || [];
    const allInvoices = invoices.data || [];
    const allCarriers = carriers.data || [];
    const allUsers = users.data || [];

    const today = new Date().toISOString().slice(0, 10);

    const totalRevenue = allInvoices
      .filter((i) => i.status === 'Paid')
      .reduce((sum, i) => sum + Number(i.total), 0);

    const overdueInvoices = allInvoices.filter(
      (i) => i.status === 'Pending' && i.duedate && i.duedate < today
    ).length;

    res.json({
      success: true,
      data: {
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter((o) => o.status === 'Pending').length,
        inTransitShipments: allShipments.filter((s) => ['In Transit', 'InTransit'].includes(s.status)).length,
        delayedShipments: allShipments.filter((s) => s.isdelayed).length,
        totalRevenue,
        activeCarriers: allCarriers.filter((c) => c.status === 'Active').length,
        overdueInvoices,
        totalUsers: allUsers.filter((u) => u.isactive).length
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getShipmentVolume(req, res, next) {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [shipmentsRes, invoicesRes] = await Promise.all([
      supabase
        .from('shipments')
        .select('shipmentid, createdat, status')
        .gte('createdat', twelveMonthsAgo.toISOString()),
      supabase
        .from('invoices')
        .select('invoiceid, total, status, invoicedate')
        .gte('invoicedate', twelveMonthsAgo.toISOString().slice(0, 10))
    ]);

    if (shipmentsRes.error) return res.status(500).json({ success: false, message: 'Failed to fetch data' });

    const monthlyData = {};
    (shipmentsRes.data || []).forEach((s) => {
      const month = s.createdat.slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { count: 0, completed: 0, revenue: 0 };
      monthlyData[month].count += 1;
      if (s.status === 'Delivered') monthlyData[month].completed += 1;
    });

    (invoicesRes.data || []).forEach((inv) => {
      if (inv.status === 'Paid' && inv.invoicedate) {
        const month = inv.invoicedate.slice(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { count: 0, completed: 0, revenue: 0 };
        monthlyData[month].revenue += Number(inv.total) || 0;
      }
    });

    const result = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, count: data.count, completed: data.completed, revenue: data.revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getTopRoutes(req, res, next) {
  try {
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select(`
        shipmentid, status,
        orders(
          pickup:locations!fk_orders_pickuploc(city),
          delivery:locations!fk_orders_delivloc(city)
        )
      `);

    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch data' });

    const routeMap = {};
    (shipments || []).forEach((s) => {
      const from = s.orders?.pickup?.city || 'Unknown';
      const to = s.orders?.delivery?.city || 'Unknown';
      const key = `${from} → ${to}`;
      if (!routeMap[key]) routeMap[key] = { total: 0, onTime: 0 };
      routeMap[key].total += 1;
      if (s.status === 'Delivered') routeMap[key].onTime += 1;
    });

    const result = Object.entries(routeMap)
      .map(([route, data]) => ({
        route,
        totalShipments: data.total,
        onTimePercent: data.total > 0 ? Math.round((data.onTime / data.total) * 100) : 0
      }))
      .sort((a, b) => b.totalShipments - a.totalShipments)
      .slice(0, 10);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getCarrierPerformance(req, res, next) {
  try {
    const { data: partners, error } = await supabase
      .from('partners')
      .select('partnerid, companyname, rating, totalshipments, ontimedeliveries, status')
      .eq('status', 'Active')
      .order('rating', { ascending: false });

    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch data' });

    const result = (partners || []).map((p) => ({
      partnerId: p.partnerid,
      companyName: p.companyname,
      rating: p.rating,
      totalShipments: p.totalshipments,
      onTimePercent: p.totalshipments > 0
        ? Math.round((p.ontimedeliveries / p.totalshipments) * 100)
        : 0,
      delayedCount: p.totalshipments - p.ontimedeliveries
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getShipmentVolume, getTopRoutes, getCarrierPerformance };
