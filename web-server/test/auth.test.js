require('./helpers/env');
const { describe, test, before, after, afterEach } = require('node:test');
const assert = require('assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./helpers/db');
const { request, auth, uniqueName, registerUser, loginAs, createCustomer, createOwner } = require('./helpers/api');

const MISSING_FIELDS = 'Missing required fields: username, password, displayName, address, email';
const WEAK_PASSWORD = 'Password must be 8-72 UTF-8 bytes and contain at least one letter and one digit';

function newUserBody(overrides = {}) {
    return {
        username: uniqueName('user'),
        password: 'password123',
        displayName: 'Dana',
        address: '1 Test Street',
        email: 'dana@example.com',
        ...overrides,
    };
}

describe('auth and users', () => {
    before(db.connect);
    afterEach(db.clear);
    after(db.close);

    describe('POST /api/users (register)', () => {
        test('creates a user and returns its id and Location', async () => {
            const res = await request().post('/api/users').send(newUserBody());

            assert.equal(res.status, 201);
            assert.deepEqual(Object.keys(res.body), ['id']);
            assert.equal(res.headers.location, `/api/users/${res.body.id}`);
        });

        for (const field of ['username', 'password', 'displayName', 'address', 'email']) {
            test(`missing ${field} -> 400`, async () => {
                const body = newUserBody();
                delete body[field];

                const res = await request().post('/api/users').send(body);

                assert.equal(res.status, 400);
                assert.deepEqual(res.body, { error: MISSING_FIELDS });
            });
        }

        const weakPasswords = {
            'no digit': 'abcdefgh',
            'no letter': '12345678',
            'shorter than 8': 'abc123',
            'longer than 72 bytes': `a1${'a'.repeat(71)}`,
        };
        for (const [label, password] of Object.entries(weakPasswords)) {
            test(`weak password (${label}) -> 400`, async () => {
                const res = await request().post('/api/users').send(newUserBody({ password }));

                assert.equal(res.status, 400);
                assert.deepEqual(res.body, { error: WEAK_PASSWORD });
            });
        }

        test('duplicate username -> 400', async () => {
            const body = newUserBody();
            await request().post('/api/users').send(body).expect(201);

            const res = await request().post('/api/users').send(body);

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Username already taken' });
        });

        test('no body -> 400', async () => {
            const res = await request().post('/api/users');

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Missing required field: body' });
        });

        test('role "restaurant" is accepted and ends up in the token', async () => {
            const owner = await createOwner();
            const claims = jwt.decode(owner.token);

            assert.equal(claims.role, 'restaurant');
            assert.equal(owner.user.role, 'restaurant');
        });

        test('role defaults to customer', async () => {
            const customer = await createCustomer();

            assert.equal(customer.user.role, 'customer');
        });

        // Regression: was 500 Error processing request (Mongoose enum error)
        test('[BF-4] unknown role -> 400', async () => {
            const res = await request().post('/api/users').send(newUserBody({ role: 'admin' }));

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Role must be customer or restaurant' });
        });

        // Regression: was 500 Error processing request (Mongoose cast error)
        test('[BF-4] non-string username -> 400', async () => {
            const res = await request().post('/api/users').send(newUserBody({ username: { $gt: '' } }));

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'username must be a string' });
        });

        test('[BF-4] non-string displayName, email, address or image -> 400', async () => {
            for (const field of ['displayName', 'email', 'address', 'image']) {
                const res = await request().post('/api/users').send(newUserBody({ [field]: 42 }));

                assert.equal(res.status, 400, field);
                assert.deepEqual(res.body, { error: `${field} must be a string` });
            }
        });
    });

    describe('POST /api/tokens (login)', () => {
        test('returns a token and the safe user shape', async () => {
            const registered = await registerUser({ displayName: 'Dana' });

            const res = await request()
                .post('/api/tokens')
                .send({ username: registered.username, password: registered.password });

            assert.equal(res.status, 200);
            assert.deepEqual(Object.keys(res.body).sort(), ['token', 'user']);
            assert.deepEqual(res.body.user, {
                id: registered.id,
                username: registered.username,
                displayName: 'Dana',
                image: '',
                role: 'customer',
            });
        });

        test('token claims and 24h lifetime', async () => {
            const registered = await registerUser({ displayName: 'Dana' });
            const { token } = await loginAs(registered.username, registered.password);

            const claims = jwt.verify(token, 'test-secret');

            assert.deepEqual(
                { id: claims.id, username: claims.username, displayName: claims.displayName, role: claims.role },
                { id: registered.id, username: registered.username, displayName: 'Dana', role: 'customer' }
            );
            assert.equal(claims.exp - claims.iat, 24 * 60 * 60);
            assert.equal(jwt.decode(token, { complete: true }).header.alg, 'HS256');
        });

        test('wrong password -> 401', async () => {
            const registered = await registerUser();

            const res = await request()
                .post('/api/tokens')
                .send({ username: registered.username, password: 'wrongpass1' });

            assert.equal(res.status, 401);
            assert.deepEqual(res.body, { error: 'Invalid username or password' });
        });

        test('unknown username -> 401 with the same message', async () => {
            const res = await request()
                .post('/api/tokens')
                .send({ username: 'nobody_here', password: 'password123' });

            assert.equal(res.status, 401);
            assert.deepEqual(res.body, { error: 'Invalid username or password' });
        });

        for (const body of [{ username: 'x' }, { password: 'y' }]) {
            test(`missing field ${JSON.stringify(body)} -> 400`, async () => {
                const res = await request().post('/api/tokens').send(body);

                assert.equal(res.status, 400);
                assert.deepEqual(res.body, { error: 'Missing required fields: username, password' });
            });
        }

        test('[BF-4] non-string username or password -> 400', async () => {
            for (const body of [{ username: { $gt: '' }, password: 'password123' }, { username: 'dana', password: 12345678 }]) {
                const res = await request().post('/api/tokens').send(body);

                assert.equal(res.status, 400, JSON.stringify(body));
                assert.match(res.body.error, /^(username|password) must be a string$/);
            }
        });

        test('no body -> 400', async () => {
            const res = await request().post('/api/tokens');

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Missing required field: body' });
        });

        // [BF-6] login/registration throttling is covered in rate-limit.test.js.

        // Regression: an unknown username returned before any bcrypt work, so
        // response time revealed whether the account exists
        test('[BF-7] unknown username runs the same bcrypt compare as a wrong password', async (t) => {
            const registered = await registerUser();
            const compare = t.mock.method(bcrypt, 'compare');

            await request().post('/api/tokens').send({ username: registered.username, password: 'wrongpass1' });
            assert.equal(compare.mock.callCount(), 1, 'known user runs one compare');

            const res = await request().post('/api/tokens').send({ username: 'nobody_here', password: 'wrongpass1' });
            assert.equal(compare.mock.callCount(), 2, 'unknown user also runs one compare');
            assert.equal(res.status, 401);
            assert.deepEqual(res.body, { error: 'Invalid username or password' });
        });
    });

    describe('requireAuth', () => {
        test('no Authorization header -> 401', async () => {
            const res = await request().get('/api/orders');

            assert.equal(res.status, 401);
            assert.deepEqual(res.body, { error: 'Unauthorized' });
        });

        test('non-bearer scheme -> 401', async () => {
            const res = await request().get('/api/orders').set('Authorization', 'Basic abc');

            assert.equal(res.status, 401);
            assert.deepEqual(res.body, { error: 'Invalid authorization header' });
        });

        test('garbage token -> 401', async () => {
            const res = await request().get('/api/orders').set(auth('not-a-jwt'));

            assert.equal(res.status, 401);
            assert.deepEqual(res.body, { error: 'Invalid or expired token' });
        });

        test('token signed with another secret -> 401', async () => {
            const customer = await createCustomer();
            const forged = jwt.sign({ id: customer.id, username: customer.username }, 'other-secret');

            const res = await request().get('/api/orders').set(auth(forged));

            assert.equal(res.status, 401);
            assert.deepEqual(res.body, { error: 'Invalid or expired token' });
        });

        test('expired token -> 401', async () => {
            const customer = await createCustomer();
            const expired = jwt.sign(
                { id: customer.id, username: customer.username, role: 'customer' },
                'test-secret',
                { expiresIn: -10 }
            );

            const res = await request().get('/api/orders').set(auth(expired));

            assert.equal(res.status, 401);
            assert.deepEqual(res.body, { error: 'Invalid or expired token' });
        });

        // PINNED: old behavior, flipped in Phase 3
        test('[BF-8] HS512 token signed with the secret is accepted', async () => {
            const customer = await createCustomer();
            const hs512 = jwt.sign(
                { id: customer.id, username: customer.username, role: 'customer' },
                'test-secret',
                { algorithm: 'HS512', expiresIn: '1h' }
            );

            const res = await request().get('/api/orders').set(auth(hs512));

            assert.equal(res.status, 200);
        });
    });

    describe('GET /api/users/:id', () => {
        test('own user -> 200 with safe fields only', async () => {
            const customer = await createCustomer({ displayName: 'Dana', address: 'Here', email: 'd@e.f' });

            const res = await request().get(`/api/users/${customer.id}`).set(auth(customer.token));

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {
                id: customer.id,
                username: customer.username,
                displayName: 'Dana',
                email: 'd@e.f',
                address: 'Here',
                image: '',
                role: 'customer',
            });
        });

        test('another user -> 403', async () => {
            const a = await createCustomer();
            const b = await createCustomer();

            const res = await request().get(`/api/users/${b.id}`).set(auth(a.token));

            assert.equal(res.status, 403);
            assert.deepEqual(res.body, { error: 'Forbidden' });
        });

        test('no token -> 401', async () => {
            const customer = await createCustomer();

            const res = await request().get(`/api/users/${customer.id}`);

            assert.equal(res.status, 401);
        });

        test('user deleted after login -> 404', async () => {
            const customer = await createCustomer();
            await db.collection('users').deleteOne({ username: customer.username });

            const res = await request().get(`/api/users/${customer.id}`).set(auth(customer.token));

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'User not found' });
        });
    });
});
