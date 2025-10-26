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
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@csiet.org',
    major: 'Computer Science',
    year: 'Senior',
    interests: ['Software Sales', 'AI/ML', 'Entrepreneurship'],
    resumeUrl: 'https://example.com/resumes/michael-chen.pdf',
  },
  {
    name: 'Sarah Martinez',
    email: 'sarah.martinez@csiet.org',
    major: 'Industrial Engineering',
    year: 'Sophomore',
    interests: ['Process Optimization', 'Client Relations', 'Data Analytics'],
    resumeUrl: 'https://example.com/resumes/sarah-martinez.pdf',
  },
  {
    name: 'David Thompson',
    email: 'david.thompson@csiet.org',
    major: 'Electrical Engineering',
    year: 'Senior',
    interests: ['Technical Sales', 'IoT Solutions', 'Networking'],
    resumeUrl: 'https://example.com/resumes/david-thompson.pdf',
  },
];

function buildProfileFields({ major, year, interests, resumeUrl }) {
  const fields = {};
  if (major !== undefined) fields.major = major;
  if (year !== undefined) fields.year = year;
  if (interests !== undefined) fields.interests = interests;
  if (resumeUrl !== undefined) fields.resumeUrl = resumeUrl;
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
}) {
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const profileFields = buildProfileFields({ major, year, interests, resumeUrl });

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
