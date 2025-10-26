import express from 'express';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/authenticate.js';

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

export function getProfileHandler(req, res) {
  return res.json({ member: req.user.toSafeObject() });
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

router.get('/', authenticate, listMembersHandler);
router.get('/me', authenticate, getProfileHandler);
router.put('/me', authenticate, updateProfileHandler);

export default router;
