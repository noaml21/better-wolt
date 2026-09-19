// A low limit for this file only; must be set before helpers/env.js runs.
process.env.AUTH_RATE_LIMIT_MAX = '5';
require('./helpers/env');
const { describe, test, before, after } = require('node:test');
const assert = require('assert/strict');
const db = require('./helpers/db');
const { request, registerUser } = require('./helpers/api');

// Regression for [BF-6]: login and registration attempts were never throttled.
// The limiter is in memory per process and keyed by IP (all requests here come
// from 127.0.0.1), so the tests share one budget per route and run in order.
describe('[BF-6] auth rate limiting (AUTH_RATE_LIMIT_MAX=5)', () => {
    before(db.connect);
    after(db.close);

    test('successful logins do not use the budget; the 6th failed login -> 429', async () => {
        const user = await registerUser();

        for (let i = 0; i < 8; i += 1) {
            const ok = await request().post('/api/tokens').send({ username: user.username, password: user.password });
            assert.equal(ok.status, 200, `successful login ${i + 1}`);
        }

        for (let i = 0; i < 5; i += 1) {
            const bad = await request().post('/api/tokens').send({ username: user.username, password: 'wrongpass1' });
            assert.equal(bad.status, 401, `failed login ${i + 1}`);
        }

        const blocked = await request().post('/api/tokens').send({ username: user.username, password: 'wrongpass1' });
        assert.equal(blocked.status, 429);
        assert.deepEqual(blocked.body, { error: 'Too many requests' });

        const correctButBlocked = await request().post('/api/tokens').send({ username: user.username, password: user.password });
        assert.equal(correctButBlocked.status, 429);
    });

    test('registration has its own budget: the 6th attempt -> 429', async () => {
        // registerUser in the previous test used one attempt.
        for (let i = 0; i < 4; i += 1) {
            await registerUser();
        }

        const res = await request().post('/api/users').send({
            username: 'one_too_many',
            password: 'password123',
            displayName: 'X',
            address: 'Y',
            email: 'z@example.com',
        });

        assert.equal(res.status, 429);
        assert.deepEqual(res.body, { error: 'Too many requests' });
    });
});
