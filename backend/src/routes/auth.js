import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendEmail } from '../utils/email.js';

export const router = express.Router();

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const getClientBaseUrl = () => {
  const origins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || '').split(',');
  const first = origins.find((o) => o.trim());
  return (first || 'http://localhost:5173').trim().replace(/\/+$/, '');
};

const generateToken = () => crypto.randomBytes(24).toString('hex');

async function sendVerificationEmail(user, verificationToken) {
  const appBase = getClientBaseUrl();
  const verifyLink = `${appBase}/verify?token=${verificationToken}`;
  const subject = 'Verify your CSIET email';
  const text = [
    'Welcome to CSIET!',
    'Please verify your email to secure your account:',
    verifyLink,
    '',
    'If you did not request this, you can ignore the message.',
    `Verification code: ${verificationToken}`,
  ].join('\n');

  await sendEmail({
    to: user.email,
    subject,
    text,
  });
}

async function sendPasswordResetEmail(user, resetToken) {
  const appBase = getClientBaseUrl();
  const resetLink = `${appBase}/reset-password?token=${resetToken}`;
  const subject = 'Reset your CSIET password';
  const text = [
    'We received a request to reset your password.',
    'Use the link or code below to set a new password:',
    resetLink,
    '',
    `Reset code: ${resetToken}`,
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n');

  await sendEmail({
    to: user.email,
    subject,
    text,
  });
}

export async function loginHandler(req, res) {
  const { email, password, role = 'member' } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim(), role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      token,
      user: user.toSafeObject(),
      emailVerified: user.emailVerified ?? true,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function registerHandler(req, res) {
  const { email, password, name, role = 'member', major, year, interests, resumeUrl, employeeName, phone } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required.' });
  }

  // Require employee name for company registrations
  if (role === 'company' && !employeeName) {
    return res.status(400).json({ message: 'Employee name is required for company registrations.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  // Validate role
  const validRoles = ['member', 'company', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail, role });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();
    const verificationExpires = new Date(Date.now() + TOKEN_EXPIRY_MS);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role,
      major: major?.trim() || '',
      year: year || '',
      interests: Array.isArray(interests) ? interests.filter(Boolean) : [],
      resumeUrl: resumeUrl?.trim() || '',
      employeeName: employeeName?.trim() || '',
      phone: phone?.trim() || '',
      emailVerified: false,
      verificationToken,
      verificationExpires,
    });

    console.log(`✅ New ${role} registered: ${user.email} (ID: ${user._id})`);

    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr);
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      token,
      user: user.toSafeObject(),
      message: 'Registration successful. Please check your email to verify your account.',
      verificationToken: process.env.NODE_ENV === 'production' ? undefined : verificationToken,
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function requestPasswordResetHandler(req, res) {
  const { email, role = 'member' } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim(), role });
    if (user) {
      const resetToken = generateToken();
      user.resetToken = resetToken;
      user.resetTokenExpires = new Date(Date.now() + TOKEN_EXPIRY_MS);
      await user.save();

      try {
        await sendPasswordResetEmail(user, resetToken);
      } catch (emailErr) {
        console.error('Password reset email failed:', emailErr);
      }
    }

    // Always respond success to avoid leaking account existence
    return res.status(200).json({
      message: 'If an account exists for that email, a reset link has been sent.',
      resetToken: process.env.NODE_ENV === 'production' ? undefined : user?.resetToken,
    });
  } catch (err) {
    console.error('Request password reset error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function resetPasswordHandler(req, res) {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function requestVerificationHandler(req, res) {
  const { email, role = 'member' } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim(), role });
    if (!user) {
      return res.status(200).json({ message: 'If an account exists for that email, a verification link has been sent.' });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: 'Email already verified.' });
    }

    const verificationToken = generateToken();
    user.verificationToken = verificationToken;
    user.verificationExpires = new Date(Date.now() + TOKEN_EXPIRY_MS);
    await user.save();

    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr);
    }

    return res.status(200).json({
      message: 'Verification email sent.',
      verificationToken: process.env.NODE_ENV === 'production' ? undefined : verificationToken,
    });
  } catch (err) {
    console.error('Request verification error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function verifyEmailHandler(req, res) {
  const { token } = req.body || {};
  if (!token) {
    return res.status(400).json({ message: 'Verification token is required.' });
  }

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: 'Email verified successfully.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Verify email error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

router.post('/login', loginHandler);
router.post('/register', registerHandler);
router.post('/request-password-reset', requestPasswordResetHandler);
router.post('/reset-password', resetPasswordHandler);
router.post('/request-verification', requestVerificationHandler);
router.post('/verify-email', verifyEmailHandler);

export default router;
