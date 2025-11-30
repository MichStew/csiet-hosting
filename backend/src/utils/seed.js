import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/csiet';

const sampleMembers = [
  {
    name: 'Emily Johnson',
    email: 'emily.johnson@csiet.org',
    major: 'Mechanical Engineering',
    year: 'Junior',
    interests: ['Product Design', 'Sales Strategy', 'Leadership'],
    resumeUrl: 'https://example.com/resumes/emily-johnson.pdf',
    profileImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@csiet.org',
    major: 'Computer Science',
    year: 'Senior',
    interests: ['Software Sales', 'AI/ML', 'Entrepreneurship'],
    resumeUrl: 'https://example.com/resumes/michael-chen.pdf',
    profileImageUrl: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Sarah Martinez',
    email: 'sarah.martinez@csiet.org',
    major: 'Industrial Engineering',
    year: 'Sophomore',
    interests: ['Process Optimization', 'Client Relations', 'Data Analytics'],
    resumeUrl: 'https://example.com/resumes/sarah-martinez.pdf',
    profileImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'David Thompson',
    email: 'david.thompson@csiet.org',
    major: 'Electrical Engineering',
    year: 'Senior',
    interests: ['Technical Sales', 'IoT Solutions', 'Networking'],
    resumeUrl: 'https://example.com/resumes/david-thompson.pdf',
    profileImageUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80',
  },
];

function buildProfileFields({ major, year, interests, resumeUrl, profileImageUrl }) {
  const fields = {};
  if (major !== undefined) fields.major = major;
  if (year !== undefined) fields.year = year;
  if (interests !== undefined) fields.interests = interests;
  if (resumeUrl !== undefined) fields.resumeUrl = resumeUrl;
  if (profileImageUrl !== undefined) fields.profileImageUrl = profileImageUrl;
  return fields;
}

async function upsertUser({
  name,
  email,
  password = 'Password123!',
  role = 'member',
  major,
  year,
  interests,
  resumeUrl,
  profileImageUrl,
}) {
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const profileFields = buildProfileFields({
    major,
    year,
    interests,
    resumeUrl,
    profileImageUrl,
  });

  const existing = await User.findOne({ email: normalizedEmail, role });
  if (existing) {
    existing.name = name;
    if (password) {
      existing.passwordHash = passwordHash;
    }
    Object.assign(existing, profileFields);
    await existing.save();
    return existing;
  }

  return User.create({
    name,
    email: normalizedEmail,
    role,
    passwordHash,
    ...profileFields,
  });
}

async function seedMembers() {
  await upsertUser({
    name: process.env.DEFAULT_MEMBER_NAME || 'Demo Member',
    email: process.env.DEFAULT_MEMBER_EMAIL || 'member@example.com',
    password: process.env.DEFAULT_MEMBER_PASSWORD || 'changeme123',
    major: 'Computer Science',
    year: 'Senior',
    interests: ['Full-stack Development', 'Community Building'],
    resumeUrl: 'https://example.com/resumes/demo-member.pdf',
    profileImageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80',
  });

  for (const member of sampleMembers) {
    // eslint-disable-next-line no-await-in-loop
    await upsertUser(member);
  }

  console.log('✅ Member seed complete.');
}

async function seedAdmin() {
  await upsertUser({
    name: process.env.DEFAULT_ADMIN_NAME || 'Site Admin',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'adminpass123',
    role: 'admin',
  });

  console.log('✅ Admin seed complete.');
}

async function seedAll() {
  await connectDB(MONGO_URI);
  await seedMembers();
  await seedAdmin();
  console.log('🌱 Seeding finished.');
  process.exit(0);
}

seedAll().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
