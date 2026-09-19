require('./helpers/env');
const { describe, test, before, after, afterEach } = require('node:test');
const assert = require('assert/strict');
const db = require('./helpers/db');
const { request, createOwner, createRestaurantAs, addProductAs } = require('./helpers/api');

describe('GET /api/search/:query', () => {
    let pizza;
    let sushi;

    before(db.connect);
    afterEach(db.clear);
    after(db.close);

    async function seed() {
        const owner = await createOwner();
        pizza = await createRestaurantAs(owner, { name: 'Napoli Pizza', address: 'Herzl 10' });
        sushi = await createRestaurantAs(owner, { name: 'Tokyo Bar', address: 'Dizengoff 5' });
        await addProductAs(owner, sushi.id, { name: 'Salmon Roll', description: 'Fresh avocado inside' });
    }

    const search = (query) => request().get(`/api/search/${encodeURIComponent(query)}`);
    const names = (res) => res.body.map((r) => r.name).sort();

    for (const [label, query, expected] of [
        ['restaurant name', 'napoli', ['Napoli Pizza']],
        ['address', 'dizengoff', ['Tokyo Bar']],
        ['product name', 'salmon', ['Tokyo Bar']],
        ['product description', 'AVOCADO', ['Tokyo Bar']],
    ]) {
        test(`matches ${label}, case-insensitively`, async () => {
            await seed();

            const res = await search(query);

            assert.equal(res.status, 200);
            assert.deepEqual(names(res), expected);
        });
    }

    test('no match -> 200 []', async () => {
        await seed();

        const res = await search('burrito');

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, []);
    });

    test('result shape equals the restaurant list shape', async () => {
        await seed();

        const res = await search('tokyo');
        const list = await request().get('/api/restaurants');

        assert.deepEqual(res.body, list.body.filter((r) => r.id === sushi.id));
    });

    test('blank query -> 400', async () => {
        const res = await request().get('/api/search/%20');

        assert.equal(res.status, 400);
        assert.deepEqual(res.body, { error: 'Missing search query' });
    });

    // Regression: was treated as a regex and matched every restaurant
    test('[BF-5] ".*" is matched literally', async () => {
        await seed();

        const res = await search('.*');

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, []);
    });

    // Regression: was an invalid regex -> 500
    test('[BF-5] "(" is matched literally -> 200', async () => {
        await seed();

        const res = await search('(');

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, []);
    });

    test('[BF-5] regex characters in names are matched literally', async () => {
        const owner = await createOwner();
        await createRestaurantAs(owner, { name: 'A.B Grill (Downtown)' });
        await createRestaurantAs(owner, { name: 'AxB Grill' });

        assert.deepEqual(names(await search('A.B')), ['A.B Grill (Downtown)']);
        assert.deepEqual(names(await search('(downtown)')), ['A.B Grill (Downtown)']);
    });
});
