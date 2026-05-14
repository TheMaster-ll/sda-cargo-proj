const crypto = require('crypto');

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${date}-${rand}`;
}

function generateShipmentNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `SHP-${date}-${rand}`;
}

function generateTrackingCode() {
  const rand = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `TRK${rand}`;
}

function generateInvoiceNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `INV-${date}-${rand}`;
}

module.exports = { generateOrderNumber, generateShipmentNumber, generateTrackingCode, generateInvoiceNumber };
