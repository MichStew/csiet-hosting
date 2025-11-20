import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';

export const router = express.Router();

export const allowedYears = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

export async function listMembersHandler(req, res) {
  try {
    const members = await User.find({ role: 'member' }).sort({ name: 1 });
    return res.json({
      members: members.map((member) => member.toSafeObject()),
    });
  } catch (err) {
    console.error('Fetch members error:', err);
    return res.status(500).json({ message: 'Unable to load members.' });
  }
}

export async function getMemberByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const member = await User.findOne({ _id: id, role: 'member' });
    if (!member) {
      return res.status(404).json({ message: 'Member not found.' });
    }
    return res.json({ member: member.toSafeObject() });
  } catch (err) {
    console.error('Get member error:', err);
    return res.status(500).json({ message: 'Unable to load member.' });
  }
}

export function getProfileHandler(req, res) {
  return res.json({ member: req.user.toSafeObject() });
}

export async function createMemberHandler(req, res) {
  const { email, password, name, major, year, interests, resumeUrl } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  if (year && !allowedYears.includes(year)) {
    return res
      .status(400)
      .json({ message: `Year must be one of: ${allowedYears.join(', ')}` });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail, role: 'member' });
    if (existing) {
      return res.status(409).json({ message: 'Member with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sanitizedInterests = Array.isArray(interests)
      ? interests.map((interest) => `${interest}`.trim()).filter((interest) => interest.length > 0)
      : [];

    const member = await User.create({
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role: 'member',
      major: major?.trim() || '',
      year: year || '',
      interests: sanitizedInterests,
      resumeUrl: resumeUrl?.trim() || '',
    });

    return res.status(201).json({
      member: member.toSafeObject(),
      message: 'Member created successfully.',
    });
  } catch (err) {
    console.error('Create member error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Member with this email already exists.' });
    }
    return res.status(500).json({ message: 'Unable to create member.' });
  }
}

export async function updateProfileHandler(req, res) {
  const { name, major, year, interests, resumeUrl } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: 'Name is required.' });
  }

  if (year && !allowedYears.includes(year)) {
    return res
      .status(400)
      .json({ message: `Year must be one of: ${allowedYears.join(', ')}` });
  }

  const sanitizedInterests = Array.isArray(interests)
    ? interests
        .map((interest) => `${interest}`.trim())
        .filter((interest) => interest.length > 0)
    : [];

  try {
    req.user.name = name.trim();
    req.user.major = major?.trim() || '';
    req.user.year = year || '';
    req.user.interests = sanitizedInterests;
    req.user.resumeUrl = resumeUrl?.trim() || '';

    await req.user.save();
    return res.json({ member: req.user.toSafeObject() });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Unable to update profile.' });
  }
}

export async function deleteProfileHandler(req, res) {
  try {
    await User.findByIdAndDelete(req.user._id);
    return res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    console.error('Delete profile error:', err);
    return res.status(500).json({ message: 'Unable to delete account.' });
  }
}

export async function deleteMemberHandler(req, res) {
  try {
    const { id } = req.params;
    const member = await User.findOne({ _id: id, role: 'member' });
    if (!member) {
      return res.status(404).json({ message: 'Member not found.' });
    }
    await User.findByIdAndDelete(id);
    return res.json({ message: 'Member deleted successfully.' });
  } catch (err) {
    console.error('Delete member error:', err);
    return res.status(500).json({ message: 'Unable to delete member.' });
  }
}

// Public endpoints (no auth required)
router.post('/', createMemberHandler); // POST /api/members - Create new member

// Authenticated endpoints
router.get('/', authenticate, listMembersHandler); // GET /api/members - List all members
router.get('/:id', authenticate, getMemberByIdHandler); // GET /api/members/:id - Get specific member
router.get('/me', authenticate, getProfileHandler); // GET /api/members/me - Get own profile
router.put('/me', authenticate, updateProfileHandler); // PUT /api/members/me - Update own profile
router.delete('/me', authenticate, deleteProfileHandler); // DELETE /api/members/me - Delete own account

// Admin-only endpoints
router.delete('/:id', authenticate, requireAdmin, deleteMemberHandler); // DELETE /api/members/:id - Admin delete member

export default router;
