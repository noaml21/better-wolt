require('./helpers/env');
const { describe, test, before, after, afterEach } = require('node:test');
const assert = require('assert/strict');
const db = require('./helpers/db');
const { request, ensureClientBuildFixture } = require('./helpers/api');

describe('app-level behavior', () => {
    let removeFixture;

    before(async () => {
        removeFixture = ensureClientBuildFixture();
        await db.connect();
    });
    afterEach(db.clear);
    after(async () => {
        removeFixture();
        await db.close();
    });

    describe('CORS', () => {
        test('allowed origin is echoed back', async () => {
            const res = await request().get('/api/restaurants').set('Origin', 'http://localhost:3000');

            assert.equal(res.status, 200);
            assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:3000');
        });

        test('requests without an Origin (curl, mobile) are allowed', async () => {
            const res = await request().get('/api/restaurants');

            assert.equal(res.status, 200);
        });

        // PINNED: old behavior, flipped in Phase 3
        test('[BF-2] disallowed origin -> 500 HTML from the default error handler', async () => {
            const res = await request().get('/api/restaurants').set('Origin', 'http://evil.example');

            assert.equal(res.status, 500);
            assert.match(res.headers['content-type'], /text\/html/);
        });
    });

    // PINNED: old behavior, flipped in Phase 3
    test('[BF-2] malformed JSON body -> 400 HTML from the default error handler', async () => {
        const res = await request()
            .post('/api/tokens')
            .set('Content-Type', 'application/json')
            .send('{bad');

        assert.equal(res.status, 400);
        assert.match(res.headers['content-type'], /text\/html/);
    });

    // PINNED: old behavior, flipped in Phase 3
    test('[BF-1] unknown /api path falls through to the SPA (200 HTML)', async () => {
        const res = await request().get('/api/does-not-exist');

        assert.equal(res.status, 200);
        assert.match(res.headers['content-type'], /text\/html/);
    });

    // PINNED: old behavior, flipped in Phase 3
    test('[BF-9] a 200 KB JSON body is parsed on any route', async () => {
        const res = await request()
            .post('/api/tokens')
            .send({ username: 'nobody_here', password: 'password123', padding: 'x'.repeat(200 * 1024) });

        assert.equal(res.status, 401);
    });

    test('non-API paths serve the SPA index.html', async () => {
        const res = await request().get('/restaurant/123');

        assert.equal(res.status, 200);
        assert.match(res.headers['content-type'], /text\/html/);
    });
});
