require('./helpers/env');
const { describe, test, before, after } = require('node:test');
const assert = require('assert/strict');
const db = require('./helpers/db');
const { request } = require('./helpers/api');

describe('GET /api/health', () => {
    before(db.connect);
    // The last test closes the connection; close() is safe to call twice.
    after(db.close);

    test('reports ok while the database is connected', async () => {
        const res = await request().get('/api/health');

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { status: 'ok' });
    });

    test('reports unavailable once the database connection is gone', async () => {
        await db.close();

        const res = await request().get('/api/health');

        assert.equal(res.status, 503);
        assert.deepEqual(res.body, { status: 'unavailable' });
    });
});
