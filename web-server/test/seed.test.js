require('./helpers/env');
const { describe, test, before, after, afterEach } = require('node:test');
const assert = require('assert/strict');
const mongoose = require('mongoose');
const db = require('./helpers/db');
const { request, auth, createCustomer } = require('./helpers/api');
// The one non-HTTP import allowed in the suite (spec §6): the seed has no endpoint.
const seedWorldCupRestaurant = require('../src/services/seedWorldCupRestaurant');

const NAME = 'חגיגת מונדיאל';
const LEGACY = ['חבילת מונדיאל זוגית', 'נשנושי מחצית'];

async function worldCup() {
    const res = await request().get('/api/restaurants');
    return res.body.find((r) => r.name === NAME);
}

describe('World Cup seed', () => {
    before(db.connect);
    afterEach(db.clear);
    after(db.close);

    test('creates the restaurant with 20 products owned by "system"', async () => {
        await seedWorldCupRestaurant();

        const restaurant = await worldCup();

        assert.ok(restaurant);
        assert.equal(restaurant.username, 'system');
        assert.equal(restaurant.address, 'World Cup Special');
        assert.equal(restaurant.products.length, 20);
        assert.equal(new Set(restaurant.products.map((p) => p.name)).size, 20);
        assert.ok(restaurant.products.every((p) => p.price === 30));
    });

    test('is idempotent: product ids stay stable across restarts', async () => {
        await seedWorldCupRestaurant();
        const first = await worldCup();

        await seedWorldCupRestaurant();
        const second = await worldCup();

        assert.deepEqual(second, first);
        const all = await request().get('/api/restaurants');
        assert.equal(all.body.filter((r) => r.name === NAME).length, 1);
    });

    test('restores edited prices/descriptions, removes duplicates and legacy products', async () => {
        await seedWorldCupRestaurant();
        const seeded = await worldCup();
        const [first, second] = seeded.products;
        const restaurants = db.collection('restaurants');
        const id = new mongoose.Types.ObjectId(seeded.id);

        await restaurants.updateOne(
            { _id: id, 'products._id': new mongoose.Types.ObjectId(first.id) },
            { $set: { 'products.$.price': 99, 'products.$.description': 'changed' } }
        );
        await restaurants.updateOne(
            { _id: id },
            {
                $push: {
                    products: {
                        $each: [
                            { _id: new mongoose.Types.ObjectId(), name: second.name, description: 'dup', price: 1 },
                            ...LEGACY.map((name) => ({ _id: new mongoose.Types.ObjectId(), name, description: '', price: 50 })),
                        ],
                    },
                },
            }
        );

        await seedWorldCupRestaurant();
        const repaired = await worldCup();

        assert.deepEqual(repaired.products, seeded.products);
    });

    test('an order for a seeded dish goes through the normal order flow', async () => {
        await seedWorldCupRestaurant();
        const restaurant = await worldCup();
        const customer = await createCustomer();
        const dish = restaurant.products[0];

        const res = await request()
            .post('/api/orders')
            .set(auth(customer.token))
            .send({ restaurant: restaurant.id, products: [{ id: dish.id, quantity: 2 }] });

        assert.equal(res.status, 201);
        assert.equal(res.body.restaurantName, NAME);
        assert.equal(res.body.total, 60);
        assert.deepEqual(res.body.orderItems, [{ productId: dish.id, name: dish.name, price: 30, quantity: 2 }]);
    });
});
