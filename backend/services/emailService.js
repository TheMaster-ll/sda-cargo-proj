const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
}

async function sendResetEmail(toEmail, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const mailOptions = {
    from: `"CargoPort TMS" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'CargoPort - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Password Reset</h2>
        <p>You requested a password reset for your CargoPort account.</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a7a7a; color: #ffffff; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p style="color: #64748b; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
}

async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const mailOptions = {
    from: `"CargoPort TMS" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'CargoPort - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Welcome to CargoPort!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a7a7a; color: #ffffff; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Email</a>
        <p style="color: #64748b; font-size: 14px;">This link expires in 24 hours.</p>
      </div>
    `
  };

  try {
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Verification email error:', err.message);
    return false;
  }
}

async function sendInviteEmail(toEmail, token, firstName, role) {
  const inviteUrl = `${process.env.CLIENT_URL}/accept-invite/${token}`;
  const roleLabel = role === 'CarrierPartner' ? 'Carrier Partner' : role;
  const mailOptions = {
    from: `"CargoPort TMS" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'CargoPort - You\'ve Been Invited!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Welcome to CargoPort!</h2>
        <p>Hi ${firstName},</p>
        <p>You've been invited to join CargoPort as a <strong>${roleLabel}</strong>.</p>
        <p>Click the button below to set your password and activate your account. This link expires in 72 hours.</p>
        <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #000; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: bold;">Accept Invite & Set Password</a>
        <p style="color: #64748b; font-size: 14px;">If you weren't expecting this invitation, you can safely ignore this email.</p>
      </div>
    `
  };

  try {
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Invite email error:', err.message);
    return false;
  }
}

module.exports = { sendResetEmail, sendVerificationEmail, sendInviteEmail };
