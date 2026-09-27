require('./helpers/env');
const { describe, test, before, after, afterEach } = require('node:test');
const assert = require('assert/strict');
const db = require('./helpers/db');
const { request } = require('./helpers/api');

describe('test infrastructure', () => {
    before(db.connect);
    afterEach(db.clear);
    after(db.close);

    test('the app answers against an empty test database', async () => {
        const res = await request().get('/api/restaurants');

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, []);
    });

    test('database guard only accepts bw_test_ names', () => {
        assert.throws(() => db.assertTestDbName('better_wolt'), /non-test database/);
        assert.doesNotThrow(() => db.assertTestDbName('bw_test_1_x'));
    });
});
