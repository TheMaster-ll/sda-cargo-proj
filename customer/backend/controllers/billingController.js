const supabase = require('../config/supabase');
const { generateInvoiceNumber } = require('../utils/generateTrackingCode');
const { createNotification } = require('../services/trackingService');

// Helper: enrich invoices with company and currency info
async function enrichInvoices(invoices) {
  if (!invoices || (Array.isArray(invoices) && invoices.length === 0)) return invoices;
  const list = Array.isArray(invoices) ? invoices : [invoices];

  const customerIds = new Set();
  const currencyIds = new Set();
  list.forEach(inv => {
    if (inv.customerid) customerIds.add(inv.customerid);
    if (inv.currencyid) currencyIds.add(inv.currencyid);
  });

  const { data: companies } = customerIds.size > 0
    ? await supabase.from('companies').select('companyid, companyname').in('companyid', [...customerIds])
    : { data: [] };
  const companyMap = Object.fromEntries((companies || []).map(c => [c.companyid, c.companyname]));

  const { data: currencies } = currencyIds.size > 0
    ? await supabase.from('currencies').select('currencyid, currencycode, symbol').in('currencyid', [...currencyIds])
    : { data: [] };
  const currencyMap = Object.fromEntries((currencies || []).map(c => [c.currencyid, c]));

  list.forEach(inv => {
    inv.companies = { companyname: companyMap[inv.customerid] || null };
    inv.currencies = currencyMap[inv.currencyid] || null;
  });

  return Array.isArray(invoices) ? list : list[0];
}

async function getMyInvoices(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        shipments(shipmentnumber, orders(ordernumber, customerid))
      `)
      .eq('customerid', req.user.companyId)
      .order('invoicedate', { ascending: false });

    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch invoices' });

    // Enrich with company names from nested orders
    if (data) {
      const customerIds = new Set();
      const currencyIds = new Set();
      data.forEach(inv => {
        if (inv.currencyid) currencyIds.add(inv.currencyid);
        if (inv.shipments?.orders?.customerid) customerIds.add(inv.shipments.orders.customerid);
      });
      const { data: companies } = customerIds.size > 0
        ? await supabase.from('companies').select('companyid, companyname').in('companyid', [...customerIds])
        : { data: [] };
      const companyMap = Object.fromEntries((companies || []).map(c => [c.companyid, c.companyname]));
      const { data: currencies } = currencyIds.size > 0
        ? await supabase.from('currencies').select('currencyid, currencycode, symbol').in('currencyid', [...currencyIds])
        : { data: [] };
      const currencyMap = Object.fromEntries((currencies || []).map(c => [c.currencyid, c]));
      data.forEach(inv => {
        inv.currencies = currencyMap[inv.currencyid] || null;
        if (inv.shipments?.orders) {
          inv.shipments.orders.companies = { companyname: companyMap[inv.shipments.orders.customerid] || null };
        }
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getAllInvoices(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        shipments(shipmentnumber, orders(ordernumber))
      `)
      .order('invoicedate', { ascending: false });

    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    await enrichInvoices(data || []);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getInvoiceByShipment(req, res, next) {
  try {
    const { shipmentId } = req.params;

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        shipments(shipmentnumber, orders(ordernumber))
      `)
      .eq('shipmentid', parseInt(shipmentId))
      .single();

    if (!data || error) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await enrichInvoices(data);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function generateInvoice(req, res, next) {
  try {
    const { shipmentId } = req.params;

    const { data: existing } = await supabase
      .from('invoices')
      .select('invoiceid')
      .eq('shipmentid', parseInt(shipmentId))
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Invoice already exists for this shipment' });
    }

    const { data: shipment } = await supabase
      .from('shipments')
      .select('shipmentid, totalcost, currencyid, orders(customerid)')
      .eq('shipmentid', parseInt(shipmentId))
      .single();

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const subtotal = Number(shipment.totalcost) || 0;
    const tax = Math.round(subtotal * 0.17 * 100) / 100;
    const total = subtotal + tax;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const { data: pkrCurrency } = await supabase
      .from('currencies')
      .select('currencyid')
      .eq('currencycode', 'PKR')
      .single();

    const currencyId = shipment.currencyid || pkrCurrency?.currencyid || 1;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        invoicenumber: generateInvoiceNumber(),
        shipmentid: shipment.shipmentid,
        customerid: shipment.orders.customerid,
        invoicedate: new Date().toISOString().slice(0, 10),
        duedate: dueDate.toISOString().slice(0, 10),
        subtotal,
        tax,
        total,
        currencyid: currencyId,
        status: 'Pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Invoice creation error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate invoice' });
    }

    const { data: customerUser } = await supabase
      .from('users')
      .select('userid')
      .eq('companyid', shipment.orders.customerid)
      .limit(1)
      .single();

    if (customerUser) {
      await createNotification(
        customerUser.userid,
        'Invoice Generated',
        `Invoice ${invoice.invoicenumber} has been generated for Rs ${total.toLocaleString()}`,
        'Info',
        'Invoice',
        invoice.invoiceid
      );
    }

    res.status(201).json({ success: true, message: 'Invoice generated', data: invoice });
  } catch (err) {
    next(err);
  }
}

async function markAsPaid(req, res, next) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('invoices')
      .update({ status: 'Paid', paiddate: new Date().toISOString().slice(0, 10) })
      .eq('invoiceid', parseInt(id));

    if (error) return res.status(500).json({ success: false, message: 'Failed to update invoice' });

    res.json({ success: true, message: 'Invoice marked as paid' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyInvoices, getAllInvoices, getInvoiceByShipment, generateInvoice, markAsPaid };
