const supabase = require('../config/supabase');

async function createTrackingEvent(shipmentId, eventType, description, locationId = null, isCustomerVisible = true) {
  const { data, error } = await supabase
    .from('trackingevents')
    .insert({
      shipmentid: shipmentId,
      eventtype: eventType,
      description,
      locationid: locationId,
      iscustomervisible: isCustomerVisible,
      eventtime: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create tracking event:', error);
  }
  return data;
}

async function createNotification(userId, title, message, type = 'Info', relatedEntityType = null, relatedEntityId = null) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      userid: userId,
      title,
      message,
      notificationtype: type,
      relatedentitytype: relatedEntityType,
      relatedentityid: relatedEntityId
    });

  if (error) {
    console.error('Failed to create notification:', error);
  }
}

async function notifyDispatchers(title, message, relatedEntityType = null, relatedEntityId = null) {
  const { data: dispatchers } = await supabase
    .from('users')
    .select('userid, usertypes!inner(typename)')
    .eq('usertypes.typename', 'Dispatcher')
    .eq('isactive', true);

  if (dispatchers && dispatchers.length > 0) {
    const notifications = dispatchers.map((d) => ({
      userid: d.userid,
      title,
      message,
      notificationtype: 'Info',
      relatedentitytype: relatedEntityType,
      relatedentityid: relatedEntityId
    }));
    await supabase.from('notifications').insert(notifications);
  }
}

module.exports = { createTrackingEvent, createNotification, notifyDispatchers };
