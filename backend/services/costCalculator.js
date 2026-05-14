const supabase = require('../config/supabase');

function determineTransportMode(weight) {
  if (weight < 500) return 'Air';
  if (weight <= 5000) return 'Road';
  return 'Sea';
}

async function calculateCost(originLocationId, destinationLocationId, weight) {
  const transportMode = determineTransportMode(weight);

  const { data: rates, error } = await supabase
    .from('rates')
    .select('*, currencies(currencycode, symbol)')
    .eq('originlocationid', originLocationId)
    .eq('destinationlocationid', destinationLocationId)
    .eq('transportmode', transportMode)
    .eq('isactive', true)
    .lte('minweight', weight);

  if (error || !rates || rates.length === 0) {
    return {
      transportMode,
      baseRate: 0,
      weightCharge: 0,
      fuelSurcharge: 0,
      total: 0,
      currency: 'PKR',
      rateFound: false
    };
  }

  const validRates = rates.filter((r) => {
    if (r.maxweight && weight > r.maxweight) return false;
    const today = new Date().toISOString().slice(0, 10);
    if (r.effectivefrom && today < r.effectivefrom) return false;
    if (r.effectiveto && today > r.effectiveto) return false;
    return true;
  });

  if (validRates.length === 0) {
    return {
      transportMode,
      baseRate: 0,
      weightCharge: 0,
      fuelSurcharge: 0,
      total: 0,
      currency: 'PKR',
      rateFound: false
    };
  }

  const rate = validRates[0];
  const weightCharge = weight * Number(rate.rateperkg);
  const baseRate = Number(rate.baserate);
  const fuelSurcharge = Number(rate.fuelsurcharge);
  const total = baseRate + weightCharge + fuelSurcharge;

  return {
    transportMode,
    baseRate,
    weightCharge,
    fuelSurcharge,
    total,
    currency: rate.currencies?.currencycode || 'PKR',
    rateId: rate.rateid,
    transitDays: rate.transitdays,
    rateFound: true
  };
}

module.exports = { calculateCost, determineTransportMode };
