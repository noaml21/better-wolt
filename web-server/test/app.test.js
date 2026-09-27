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

        // Regression: was 500 HTML from Express's default error handler
        test('[BF-2] disallowed origin -> 403 JSON', async () => {
            const res = await request().get('/api/restaurants').set('Origin', 'http://evil.example');

            assert.equal(res.status, 403);
            assert.deepEqual(res.body, { error: 'Origin not allowed' });
        });
    });

    // Regression: was 400 HTML from Express's default error handler
    test('[BF-2] malformed JSON body -> 400 JSON', async () => {
        const res = await request()
            .post('/api/tokens')
            .set('Content-Type', 'application/json')
            .send('{bad');

        assert.equal(res.status, 400);
        assert.deepEqual(res.body, { error: 'Invalid JSON' });
    });

    test('[BF-2] body over the parser limit keeps 413, now as JSON', async () => {
        const res = await request()
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ image: 'x'.repeat(6 * 1024 * 1024) }));

        assert.equal(res.status, 413);
        assert.deepEqual(res.body, { error: 'Payload too large' });
    });

    // Regression: was 200 with the SPA index.html
    test('[BF-1] unknown /api path -> 404 JSON', async () => {
        for (const res of [
            await request().get('/api/does-not-exist'),
            await request().post('/api/restaurants/x/y/z').send({}),
            await request().get('/api'),
        ]) {
            assert.equal(res.status, 404, res.req.path);
            assert.match(res.headers['content-type'], /application\/json/);
            assert.deepEqual(res.body, { error: 'Not found' });
        }
    });

    // Regression: every route accepted JSON bodies up to 5 MB
    test('[BF-9] a 200 KB JSON body is rejected outside registration', async () => {
        const res = await request()
            .post('/api/tokens')
            .send({ username: 'nobody_here', password: 'password123', padding: 'x'.repeat(200 * 1024) });

        assert.equal(res.status, 413);
        assert.deepEqual(res.body, { error: 'Payload too large' });
    });

    test('[BF-9] registration still accepts a large avatar', async () => {
        const res = await request().post('/api/users').send({
            username: 'avatar_user',
            password: 'password123',
            displayName: 'Avatar',
            address: 'Here',
            email: 'a@example.com',
            image: `data:image/jpeg;base64,${'A'.repeat(1024 * 1024)}`,
        });

        assert.equal(res.status, 201);
    });

    test('non-API paths serve the SPA index.html', async () => {
        const res = await request().get('/restaurant/123');

        assert.equal(res.status, 200);
        assert.match(res.headers['content-type'], /text\/html/);
    });
});
