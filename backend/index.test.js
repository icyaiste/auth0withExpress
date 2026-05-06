import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { createServer } from 'node:http';

// Fake auth middleware for backend integration tests.
// It behaves like requiresAuth(): block if there is no test user,
// allow if x-test-user header is present.
const fakeRequiresAuth = (req, res, next) => {
  if (!req.headers['x-test-user']) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  req.oidc = { user: { name: 'Ada', email: 'ada@test.com', given_name: 'Ada' } };
  next();
};

const app = express();
app.use(express.json());

app.get('/profile', fakeRequiresAuth, (req, res) => {
  res.json(req.oidc.user);
});

app.get('/secure-data', fakeRequiresAuth, (req, res) => {
  res.json({ message: 'This is protected data', user: req.oidc.user });
});

let server;
let baseUrl;

beforeAll(() => {
  server = createServer(app);
  server.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
});

afterAll(() => {
  server.close();
});

describe('GET /profile', () => {
  it('returns 401 when the user is not logged in', async () => {
    const res = await fetch(`${baseUrl}/profile`);
    expect(res.status).toBe(401);
  });

  it('returns user data when the user is logged in', async () => {
    const res = await fetch(`${baseUrl}/profile`, {
      headers: { 'x-test-user': 'true' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');

    const data = await res.json();
    expect(data.email).toBe('ada@test.com');
    expect(data.name).toBe('Ada');
    expect(data.given_name).toBe('Ada');
  });

  it('returns a JSON error payload when not authenticated', async () => {
    const res = await fetch(`${baseUrl}/profile`);

    expect(res.status).toBe(401);
    const payload = await res.json();
    expect(payload).toEqual({ error: 'Not authenticated' });
  });
});

describe('GET /secure-data', () => {
  it('returns 401 when the user is not logged in', async () => {
    const res = await fetch(`${baseUrl}/secure-data`);
    expect(res.status).toBe(401);
  });

  it('returns protected data when the user is logged in', async () => {
    const res = await fetch(`${baseUrl}/secure-data`, {
      headers: { 'x-test-user': 'true' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');

    const data = await res.json();
    expect(data.message).toBe('This is protected data');
    expect(data.user.email).toBe('ada@test.com');
    expect(data.user.name).toBe('Ada');
  });

  it('returns 404 for an unknown route', async () => {
    const res = await fetch(`${baseUrl}/unknown-route`);
    expect(res.status).toBe(404);
  });
});
