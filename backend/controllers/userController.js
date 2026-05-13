const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const { sendInviteEmail } = require('../services/emailService');
const { logAudit } = require('../services/auditService');

async function getMe(req, res, next) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        userid, username, email, firstname, lastname, phone, bio, linkedin,
        isactive, companyid, createdat, lastlogin,
        usertypes ( typename, permissionlevel ),
        companies ( companyname )
      `)
      .eq('userid', req.user.id)
      .single();

    if (!user || error) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.userid,
        username: user.username,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        phone: user.phone,
        role: user.usertypes?.typename,
        permissionLevel: user.usertypes?.permissionlevel,
        companyId: user.companyid,
        companyName: user.companies?.companyname,
        bio: user.bio,
        linkedin: user.linkedin,
        isActive: user.isactive,
        createdAt: user.createdat,
        lastLogin: user.lastlogin
      }
    });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { firstName, lastName, phone, bio, linkedin } = req.body;
    const updates = { updatedat: new Date().toISOString() };
    if (firstName) updates.firstname = firstName;
    if (lastName) updates.lastname = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (linkedin !== undefined) updates.linkedin = linkedin;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('userid', req.user.id)
      .select('userid, firstname, lastname, phone, bio, linkedin')
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }

    res.json({ success: true, message: 'Profile updated', data });
  } catch (err) {
    next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        userid, username, email, firstname, lastname, phone,
        isactive, emailverified, createdat, lastlogin,
        usertypes ( typename ),
        companies ( companyname )
      `)
      .order('createdat', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }

    const formatted = users.map((u) => ({
      id: u.userid,
      name: `${u.firstname} ${u.lastname}`,
      email: u.email,
      role: u.usertypes?.typename,
      company: u.companies?.companyname,
      isActive: u.isactive,
      emailVerified: u.emailverified,
      lastLogin: u.lastlogin,
      createdAt: u.createdat
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

async function changeRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const { data: userType } = await supabase
      .from('usertypes')
      .select('usertypeid')
      .eq('typename', role)
      .single();

    if (!userType) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const { error } = await supabase
      .from('users')
      .update({ usertypeid: userType.usertypeid, updatedat: new Date().toISOString() })
      .eq('userid', parseInt(id));

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to change role' });
    }

    await logAudit(req.user.id, 'Role Change', 'User', parseInt(id), { newRole: role }, req.ip);
    res.json({ success: true, message: `Role changed to ${role}` });
  } catch (err) {
    next(err);
  }
}

async function toggleStatus(req, res, next) {
  try {
    const { id } = req.params;

    const { data: user } = await supabase
      .from('users')
      .select('isactive')
      .eq('userid', parseInt(id))
      .single();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { error } = await supabase
      .from('users')
      .update({ isactive: !user.isactive, updatedat: new Date().toISOString() })
      .eq('userid', parseInt(id));

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to update status' });
    }

    await logAudit(req.user.id, user.isactive ? 'User Deactivated' : 'User Activated', 'User', parseInt(id), null, req.ip);
    res.json({ success: true, message: `User ${user.isactive ? 'deactivated' : 'activated'}` });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('userid, passwordhash')
      .eq('userid', req.user.id)
      .single();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const validCurrent = await bcrypt.compare(currentPassword, user.passwordhash);
    if (!validCurrent) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await supabase
      .from('users')
      .update({ passwordhash: newHash, updatedat: new Date().toISOString() })
      .eq('userid', req.user.id);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

async function inviteUser(req, res, next) {
  try {
    const { firstName, lastName, email, role, companyName } = req.body;

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('userid')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    // Get usertype
    const { data: userType } = await supabase
      .from('usertypes')
      .select('usertypeid')
      .eq('typename', role)
      .single();

    if (!userType) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Handle company
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
        const { data: newCompany } = await supabase
          .from('companies')
          .insert({ companyname: companyName })
          .select('companyid')
          .single();
        if (newCompany) companyId = newCompany.companyid;
      }
    }

    // Generate invite token and placeholder password
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72 hours
    const placeholderHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const username = email.split('@')[0] + '_' + Date.now().toString(36);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        passwordhash: placeholderHash,
        firstname: firstName,
        lastname: lastName,
        phone: null,
        usertypeid: userType.usertypeid,
        companyid: companyId,
        isactive: true,
        emailverified: false,
        verificationtoken: inviteToken,
        verificationtokenexpires: inviteExpires
      })
      .select('userid, firstname, lastname, email')
      .single();

    if (error) {
      console.error('Invite user error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create user' });
    }

    // Send invite email
    await sendInviteEmail(email, inviteToken, firstName, role);

    res.status(201).json({
      success: true,
      message: `Invite sent to ${email}`,
      data: { id: newUser.userid, name: `${newUser.firstname} ${newUser.lastname}`, email: newUser.email }
    });
  } catch (err) {
    next(err);
  }
}

async function acceptInvite(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('userid, email, firstname, lastname, verificationtokenexpires')
      .eq('verificationtoken', token)
      .single();

    if (!user || error) {
      return res.status(400).json({ success: false, message: 'Invalid or expired invite link' });
    }

    if (new Date(user.verificationtokenexpires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Invite link has expired. Please ask your admin to resend.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await supabase
      .from('users')
      .update({
        passwordhash: passwordHash,
        emailverified: true,
        verificationtoken: null,
        verificationtokenexpires: null,
        updatedat: new Date().toISOString()
      })
      .eq('userid', user.userid);

    res.json({
      success: true,
      message: 'Account activated! You can now sign in.',
      data: { email: user.email, name: `${user.firstname} ${user.lastname}` }
    });
  } catch (err) {
    next(err);
  }
}

async function resendInvite(req, res, next) {
  try {
    const { id } = req.params;

    const { data: user } = await supabase
      .from('users')
      .select('userid, email, firstname, emailverified, usertypes ( typename )')
      .eq('userid', parseInt(id))
      .single();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.emailverified) {
      return res.status(400).json({ success: false, message: 'User has already accepted their invite' });
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    await supabase
      .from('users')
      .update({ verificationtoken: inviteToken, verificationtokenexpires: inviteExpires })
      .eq('userid', user.userid);

    await sendInviteEmail(user.email, inviteToken, user.firstname, user.usertypes?.typename);

    res.json({ success: true, message: `Invite resent to ${user.email}` });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, changePassword, getAllUsers, changeRole, toggleStatus, inviteUser, acceptInvite, resendInvite };
