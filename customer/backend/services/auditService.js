const supabase = require('../config/supabase');

async function logAudit(userId, action, entityType = null, entityId = null, details = null, ipAddress = null) {
  try {
    const { error } = await supabase.from('auditlog').insert({
      userid: userId,
      action,
      entitytype: entityType,
      entityid: entityId,
      details: details || null,
      ipaddress: ipAddress
    });
    if (error) console.error('Audit log insert error:', error.message);
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

module.exports = { logAudit };
