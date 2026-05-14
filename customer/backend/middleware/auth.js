const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user is still active in the database
    const { data: user } = await supabase
      .from('users')
      .select('isactive')
      .eq('userid', decoded.id)
      .single();

    if (!user || !user.isactive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated. Contact admin at support@cargoport.pk or +92-21-111-CARGO.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
