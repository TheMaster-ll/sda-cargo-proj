const supabase = require('../config/supabase');

async function getNotifications(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userid', req.user.id)
      .order('isread', { ascending: true })
      .order('createdat', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .update({ isread: true })
      .eq('notificationid', parseInt(id))
      .eq('userid', req.user.id);

    if (error) return res.status(500).json({ success: false, message: 'Failed to mark as read' });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ isread: true })
      .eq('userid', req.user.id)
      .eq('isread', false);

    if (error) return res.status(500).json({ success: false, message: 'Failed to mark all as read' });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead };
