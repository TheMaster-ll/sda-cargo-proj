function formatCurrency(amount) {
  if (amount == null) return 'Rs 0';
  return `Rs ${Number(amount).toLocaleString('en-PK')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
}

module.exports = { formatCurrency, formatDate };
