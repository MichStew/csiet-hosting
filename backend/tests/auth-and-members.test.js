import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { loginHandler } from '../src/routes/auth.js';
import {
  listMembersHandler,
  getProfileHandler,
  updateProfileHandler,
} from '../src/routes/members.js';
import { authenticate } from '../src/middleware/authenticate.js';
import { User } from '../src/models/User.js';

function buildMember(overrides = {}) {
  return {
    _id: overrides._id || new mongoose.Types.ObjectId(),
    name: overrides.name || 'Test Member',
    email: (overrides.email || 'member@example.com').toLowerCase(),
    role: overrides.role || 'member',
    passwordHash:
      overrides.passwordHash ||
      bcrypt.hashSync(overrides.password || 'Password123!', 10),
    major: overrides.major ?? 'Computer Science',
    year: overrides.year ?? 'Senior',
    interests: overrides.interests ?? ['Leadership'],
    resumeUrl: overrides.resumeUrl ?? 'https://example.com/resume.pdf',
  };
}

function createUserDoc(overrides = {}) {
  return new User(buildMember(overrides));
}

function createMockResponse() {
  const res = {
    statusCode: 200,
    body: undefined,
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
}

function createRequest(overrides = {}) {
  return {
    body: {},
    headers: {},
    ...overrides,
  };
}

function mockSortedFind(result) {
  return {
    sort: vi.fn().mockResolvedValue(result),
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('login handler', () => {
  it('issues a JWT for valid credentials', async () => {
    const memberDoc = createUserDoc({ email: 'login@example.com', name: 'Login User' });
    vi.spyOn(User, 'findOne').mockResolvedValue(memberDoc);

    const req = createRequest({
      body: { email: 'login@example.com', password: 'Password123!' },
    });
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toMatchObject({
      email: 'login@example.com',
      name: 'Login User',
    });
  });

  it('rejects unknown users', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null);

    const req = createRequest({
      body: { email: 'missing@example.com', password: 'Password123!' },
    });
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('authenticates admins when role is provided', async () => {
    const adminDoc = createUserDoc({ email: 'admin@example.com', role: 'admin' });
    vi.spyOn(User, 'findOne').mockResolvedValue(adminDoc);

    const req = createRequest({
      body: { email: 'admin@example.com', password: 'Password123!', role: 'admin' },
    });
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('admin');
  });
});

describe('authenticate middleware', () => {
  it('attaches the member from a valid token', async () => {
    const memberDoc = createUserDoc({ email: 'auth@example.com' });
    vi.spyOn(User, 'findById').mockResolvedValue(memberDoc);
    const token = jwt.sign(
      { sub: memberDoc._id.toString(), role: memberDoc.role },
      process.env.JWT_SECRET || 'dev-secret'
    );

    const req = createRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.email).toBe(memberDoc.email);
  });

  it('fails when no token is provided', async () => {
    const req = createRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token missing/i);
  });
});

describe('member handlers', () => {
  it('lists member profiles in a safe shape', async () => {
    const members = [
      createUserDoc({ email: 'alice@example.com', name: 'Alice' }),
      createUserDoc({ email: 'bob@example.com', name: 'Bob' }),
    ];
    vi.spyOn(User, 'find').mockReturnValue(mockSortedFind(members));

    const res = createMockResponse();
    await listMembersHandler(createRequest({ user: members[0] }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.members).toHaveLength(2);
    expect(res.body.members[0]).not.toHaveProperty('passwordHash');
  });

  it('returns the authenticated profile', () => {
    const memberDoc = createUserDoc({ email: 'me@example.com' });
    const req = createRequest({ user: memberDoc });
    const res = createMockResponse();

    getProfileHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.member.email).toBe('me@example.com');
  });

  it('updates a profile and trims optional fields', async () => {
    const reqUser = createUserDoc({ email: 'edit@example.com', name: 'Original Name' });
    vi.spyOn(reqUser, 'save').mockResolvedValue(reqUser);

    const req = createRequest({
      user: reqUser,
      body: {
        name: 'Updated Name',
        major: 'Data Science',
        year: 'Junior',
        interests: ['AI', '  Robotics ', '', 'Leadership'],
        resumeUrl: ' https://example.com/new.pdf ',
      },
    });
    const res = createMockResponse();

    await updateProfileHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.member).toMatchObject({
      name: 'Updated Name',
      major: 'Data Science',
      year: 'Junior',
      resumeUrl: 'https://example.com/new.pdf',
      interests: ['AI', 'Robotics', 'Leadership'],
    });
  });

  it('validates academic year choices', async () => {
    const memberDoc = createUserDoc({ email: 'invalid@example.com' });
    const req = createRequest({
      user: memberDoc,
      body: { name: 'Still Valid', year: 'NotAYear' },
    });
    const res = createMockResponse();

    await updateProfileHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/year must be one of/i);
  });
});
