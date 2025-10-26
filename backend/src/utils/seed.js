import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/csiet';

async function seedDefaultMember() {
  const email = (process.env.DEFAULT_MEMBER_EMAIL || 'member@example.com').toLowerCase();
  const password = process.env.DEFAULT_MEMBER_PASSWORD || 'changeme123';
  const name = process.env.DEFAULT_MEMBER_NAME || 'Demo Member';

  await connectDB(MONGO_URI);

  const existing = await User.findOne({ email, role: 'member' });
  if (existing) {
    console.log('ℹ️  Default member already exists.');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    role: 'member',
    passwordHash,
  });

  console.log('✅ Default member created:');
  console.log(`   email: ${email}`);
  console.log(`   password: ${password}`);
  process.exit(0);
}

seedDefaultMember().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
