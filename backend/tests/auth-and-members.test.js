import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import mockingoose from 'mockingoose';
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

beforeEach(() => {
  mockingoose.resetAll();
});

describe('login handler', () => {
  it('issues a JWT for valid credentials', async () => {
    const memberDoc = buildMember({ email: 'login@example.com', name: 'Login User' });
    mockingoose(User).toReturn(memberDoc, 'findOne');

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
    mockingoose(User).toReturn(null, 'findOne');

    const req = createRequest({
      body: { email: 'missing@example.com', password: 'Password123!' },
    });
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('authenticates admins when role is provided', async () => {
    const adminDoc = buildMember({ email: 'admin@example.com', role: 'admin' });
    mockingoose(User).toReturn(adminDoc, 'findOne');

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
    const memberDoc = buildMember({ email: 'auth@example.com' });
    mockingoose(User).toReturn(memberDoc, 'findOne');
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
      buildMember({ email: 'alice@example.com', name: 'Alice' }),
      buildMember({ email: 'bob@example.com', name: 'Bob' }),
    ];
    mockingoose(User).toReturn(members, 'find');

    const res = createMockResponse();
    await listMembersHandler(createRequest({ user: members[0] }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.members).toHaveLength(2);
    expect(res.body.members[0]).not.toHaveProperty('passwordHash');
  });

  it('returns the authenticated profile', () => {
    const memberDoc = buildMember({ email: 'me@example.com' });
    const req = createRequest({ user: new User(memberDoc) });
    const res = createMockResponse();

    getProfileHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.member.email).toBe('me@example.com');
  });

  it('updates a profile and trims optional fields', async () => {
    const memberDoc = buildMember({ email: 'edit@example.com', name: 'Original Name' });
    const reqUser = new User(memberDoc);
    const updatedDoc = {
      ...memberDoc,
      name: 'Updated Name',
      major: 'Data Science',
      year: 'Junior',
      interests: ['AI', 'Robotics', 'Leadership'],
      resumeUrl: 'https://example.com/new.pdf',
    };

    mockingoose(User).toReturn(updatedDoc, 'save');

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
    const memberDoc = buildMember({ email: 'invalid@example.com' });
    const req = createRequest({
      user: new User(memberDoc),
      body: { name: 'Still Valid', year: 'NotAYear' },
    });
    const res = createMockResponse();

    await updateProfileHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/year must be one of/i);
  });
});
