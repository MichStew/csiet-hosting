import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const router = express.Router();

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
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function registerHandler(req, res) {
  const { email, password, name, role = 'member', major, year, interests, resumeUrl } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail, role });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role,
      major: major?.trim() || '',
      year: year || '',
      interests: Array.isArray(interests) ? interests.filter(Boolean) : [],
      resumeUrl: resumeUrl?.trim() || '',
    });

    console.log(`✅ New ${role} registered: ${user.email} (ID: ${user._id})`);

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
      message: 'Registration successful.',
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

router.post('/login', loginHandler);
router.post('/register', registerHandler);

export default router;
