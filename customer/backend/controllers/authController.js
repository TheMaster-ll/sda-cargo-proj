const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const { sendResetEmail, sendVerificationEmail } = require('../services/emailService');
const { logAudit } = require('../services/auditService');

async function register(req, res, next) {
  try {
    const { firstName, lastName, email, phone, password, role, companyName } = req.body;

    const { data: existingUser } = await supabase
      .from('users')
      .select('userid')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const { data: userType } = await supabase
      .from('usertypes')
      .select('usertypeid')
      .eq('typename', role)
      .single();

    if (!userType) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    let companyId = null;
    if (companyName) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('companyid')
        .eq('companyname', companyName)
        .single();

      if (existingCompany) {
        companyId = existingCompany.companyid;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({ companyname: companyName })
          .select('companyid')
          .single();

        if (companyError) {
          return res.status(500).json({ success: false, message: 'Failed to create company' });
        }
        companyId = newCompany.companyid;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const username = email.split('@')[0] + '_' + Date.now().toString(36);

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        username,
        email,
        passwordhash: passwordHash,
        firstname: firstName,
        lastname: lastName,
        phone: phone || null,
        usertypeid: userType.usertypeid,
        companyid: companyId,
        emailverified: false,
        verificationtoken: verificationToken,
        verificationtokenexpires: verificationExpires
      })
      .select('userid, firstname, lastname, email')
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(500).json({ success: false, message: 'Failed to create user' });
    }

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Account created. Please check your email to verify your account.',
      data: { id: newUser.userid, name: `${newUser.firstname} ${newUser.lastname}`, email: newUser.email }
    });
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('userid, verificationtokenexpires')
      .eq('verificationtoken', token)
      .single();

    if (!user || error) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    if (new Date(user.verificationtokenexpires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification token has expired' });
    }

    await supabase
      .from('users')
      .update({ emailverified: true, verificationtoken: null, verificationtokenexpires: null })
      .eq('userid', user.userid);

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Support login by email or username
    const isEmail = email && email.includes('@');
    let query = supabase
      .from('users')
      .select(`
        userid, username, email, passwordhash, firstname, lastname, phone,
        isactive, companyid, emailverified,
        usertypes ( typename )
      `);

    if (isEmail) {
      query = query.eq('email', email);
    } else {
      query = query.eq('username', email);
    }

    const { data: user, error } = await query.single();

    if (!user || error) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isactive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin at support@cargoport.pk or +92-21-111-CARGO.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordhash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const role = user.usertypes?.typename;
    const token = jwt.sign(
      { id: user.userid, email: user.email, role, companyId: user.companyid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    await supabase
      .from('users')
      .update({ lastlogin: new Date().toISOString() })
      .eq('userid', user.userid);

    await logAudit(user.userid, 'Login', 'User', user.userid, { role, email: user.email }, req.ip);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.userid,
          name: `${user.firstname} ${user.lastname}`,
          firstName: user.firstname,
          lastName: user.lastname,
          email: user.email,
          phone: user.phone,
          role,
          companyId: user.companyid,
          emailVerified: user.emailverified
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('userid, email')
      .eq('email', email)
      .single();

    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const hashedPassword = await bcrypt.hash('password123', 10);
    await supabase
      .from('users')
      .update({ passwordhash: hashedPassword, resettoken: resetToken, resettokenexpires: resetExpires })
      .eq('userid', user.userid);

    await sendResetEmail(user.email, resetToken);

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('userid, resettokenexpires')
      .eq('resettoken', token)
      .single();

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid reset token' });
    }

    if (new Date(user.resettokenexpires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset token has expired' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await supabase
      .from('users')
      .update({ passwordhash: passwordHash, resettoken: null, resettokenexpires: null })
      .eq('userid', user.userid);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword };
