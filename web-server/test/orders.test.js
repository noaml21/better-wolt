require('./helpers/env');
const { describe, test, before, after, afterEach } = require('node:test');
const assert = require('assert/strict');
const db = require('./helpers/db');
const { request, auth, createCustomer, createOwner, createRestaurantAs, addProductAs } = require('./helpers/api');

const MISSING_ID = '64b000000000000000000000';
const utcDate = () => new Date().toISOString().split('T')[0];

describe('orders', () => {
    let owner;
    let customer;
    let restaurant;
    let soup;
    let bread;

    before(db.connect);
    afterEach(db.clear);
    after(db.close);

    async function setup() {
        owner = await createOwner();
        customer = await createCustomer();
        restaurant = await createRestaurantAs(owner, { name: 'Diner' });
        soup = await addProductAs(owner, restaurant.id, { name: 'Soup', price: 12.5 });
        bread = await addProductAs(owner, restaurant.id, { name: 'Bread', price: 4 });
    }

    function placeOrder(actor, body) {
        return request().post('/api/orders').set(auth(actor.token)).send(body);
    }

    describe('POST /api/orders', () => {
        test('server resolves products, snapshots prices and computes totals', async () => {
            await setup();
            const before = utcDate();

            const res = await placeOrder(customer, {
                restaurant: restaurant.id,
                products: [{ id: soup.id, quantity: 2 }, { id: bread.id, quantity: 1 }],
            });
            const after = utcDate();

            assert.equal(res.status, 201);
            assert.equal(res.headers.location, `/api/orders/${res.body.id}`);
            assert.equal(res.body.username, customer.username);
            assert.equal(res.body.restaurant, restaurant.id);
            assert.equal(res.body.restaurantName, 'Diner');
            assert.deepEqual(res.body.orderItems, [
                { productId: soup.id, name: 'Soup', price: 12.5, quantity: 2 },
                { productId: bread.id, name: 'Bread', price: 4, quantity: 1 },
            ]);
            assert.deepEqual(res.body.products, [soup.id, soup.id, bread.id]);
            assert.equal(res.body.items, 3);
            assert.equal(res.body.total, 29);
            assert.equal(res.body.status, 'בדרך 🛵');
            assert.ok([before, after].includes(res.body.date), `date ${res.body.date}`);
            assert.equal(typeof res.body.startTime, 'number');
            assert.ok(Math.abs(Date.now() - res.body.startTime) < 60_000);
            assert.deepEqual(Object.keys(res.body).sort(), [
                'date', 'id', 'items', 'orderItems', 'products', 'restaurant', 'restaurantName',
                'startTime', 'status', 'total', 'username',
            ]);
        });

        test('client-sent price, total, status, items, date and username are ignored', async () => {
            await setup();
            const other = await createCustomer();

            const res = await placeOrder(customer, {
                restaurant: restaurant.id,
                products: [{ id: soup.id, quantity: 1, price: 0.01, name: 'Cheap' }],
                total: 0.01,
                items: 99,
                status: 'delivered',
                date: '2000-01-01',
                username: other.username,
            });

            assert.equal(res.status, 201);
            assert.equal(res.body.total, 12.5);
            assert.equal(res.body.items, 1);
            assert.equal(res.body.orderItems[0].price, 12.5);
            assert.equal(res.body.orderItems[0].name, 'Soup');
            assert.equal(res.body.status, 'בדרך 🛵');
            assert.notEqual(res.body.date, '2000-01-01');
            assert.equal(res.body.username, customer.username);
        });

        test('duplicate product ids are merged', async () => {
            await setup();

            const res = await placeOrder(customer, {
                restaurant: restaurant.id,
                products: [{ id: soup.id, quantity: 1 }, { id: soup.id, quantity: 2 }],
            });

            assert.equal(res.status, 201);
            assert.deepEqual(res.body.orderItems, [{ productId: soup.id, name: 'Soup', price: 12.5, quantity: 3 }]);
            assert.equal(res.body.items, 3);
            assert.equal(res.body.total, 37.5);
        });

        test('total is rounded to 2 decimals', async () => {
            await setup();
            const dime = await addProductAs(owner, restaurant.id, { name: 'Dime', price: 0.1 });

            const res = await placeOrder(customer, { restaurant: restaurant.id, products: [{ id: dime.id, quantity: 3 }] });

            assert.equal(res.status, 201);
            assert.equal(res.body.total, 0.3);
        });

        test('restaurant owners can order too', async () => {
            await setup();

            const res = await placeOrder(owner, { restaurant: restaurant.id, products: [{ id: bread.id, quantity: 1 }] });

            assert.equal(res.status, 201);
            assert.equal(res.body.username, owner.username);
        });

        test('no token -> 401', async () => {
            const res = await request().post('/api/orders').send({ restaurant: MISSING_ID, products: [] });

            assert.equal(res.status, 401);
        });

        const badShapes = {
            'missing restaurant': (r, p) => ({ products: [{ id: p, quantity: 1 }] }),
            'products not an array': (r, p) => ({ restaurant: r, products: { id: p, quantity: 1 } }),
            'missing products': (r) => ({ restaurant: r }),
        };
        for (const [label, build] of Object.entries(badShapes)) {
            test(`${label} -> 400 Bad Request`, async () => {
                await setup();

                const res = await placeOrder(customer, build(restaurant.id, soup.id));

                assert.equal(res.status, 400);
                assert.deepEqual(res.body, { error: 'Bad Request' });
            });
        }

        test('empty products -> 400', async () => {
            await setup();

            const res = await placeOrder(customer, { restaurant: restaurant.id, products: [] });

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Order must contain at least one product' });
        });

        for (const quantity of [0, -1, 1.5, '2', undefined]) {
            test(`quantity ${JSON.stringify(quantity)} -> 400`, async () => {
                await setup();

                const res = await placeOrder(customer, { restaurant: restaurant.id, products: [{ id: soup.id, quantity }] });

                assert.equal(res.status, 400);
                assert.deepEqual(res.body, { error: 'Quantity must be a positive integer' });
            });
        }

        for (const entry of ['abc', null, 5]) {
            test(`product entry ${JSON.stringify(entry)} -> 400`, async () => {
                await setup();

                const res = await placeOrder(customer, { restaurant: restaurant.id, products: [entry] });

                assert.equal(res.status, 400);
                assert.deepEqual(res.body, { error: 'Each product must include an id and quantity' });
            });
        }

        for (const [label, id] of [['unknown', MISSING_ID], ['invalid', 'not-an-id']]) {
            test(`${label} restaurant id -> 404`, async () => {
                await setup();

                const res = await placeOrder(customer, { restaurant: id, products: [{ id: soup.id, quantity: 1 }] });

                assert.equal(res.status, 404);
                assert.deepEqual(res.body, { error: 'Restaurant not found' });
            });
        }

        test('product from another restaurant -> 404', async () => {
            await setup();
            const otherRestaurant = await createRestaurantAs(owner, { name: 'Elsewhere' });
            const foreign = await addProductAs(owner, otherRestaurant.id, { price: 1 });

            const res = await placeOrder(customer, { restaurant: restaurant.id, products: [{ id: foreign.id, quantity: 1 }] });

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'Product not found in restaurant menu' });
        });

        test('existing orders keep the price snapshot after a menu change', async () => {
            await setup();
            const created = await placeOrder(customer, { restaurant: restaurant.id, products: [{ id: soup.id, quantity: 2 }] });

            await request()
                .patch(`/api/restaurants/${restaurant.id}/products/${soup.id}`)
                .set(auth(owner.token))
                .send({ price: 99, name: 'Renamed soup' })
                .expect(200);

            const res = await request().get(`/api/orders/${created.body.id}`).set(auth(customer.token));

            assert.equal(res.status, 200);
            assert.equal(res.body.total, 25);
            assert.deepEqual(res.body.orderItems[0], { productId: soup.id, name: 'Soup', price: 12.5, quantity: 2 });
        });
    });

    describe('reading and deleting orders', () => {
        test('GET /api/orders lists only the caller\'s orders', async () => {
            await setup();
            const other = await createCustomer();
            const mine = await placeOrder(customer, { restaurant: restaurant.id, products: [{ id: soup.id, quantity: 1 }] });
            await placeOrder(other, { restaurant: restaurant.id, products: [{ id: bread.id, quantity: 1 }] });

            const res = await request().get('/api/orders').set(auth(customer.token));

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, [mine.body]);
        });

        test('GET /api/orders with no orders -> []', async () => {
            await setup();

            const res = await request().get('/api/orders').set(auth(customer.token));

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, []);
        });

        test('GET /api/orders without token -> 401', async () => {
            const res = await request().get('/api/orders');

            assert.equal(res.status, 401);
        });

        test('GET own order -> 200', async () => {
            await setup();
            const created = await placeOrder(customer, { restaurant: restaurant.id, products: [{ id: soup.id, quantity: 1 }] });

            const res = await request().get(`/api/orders/${created.body.id}`).set(auth(customer.token));

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, created.body);
        });

        test('GET another user\'s order -> 404', async () => {
            await setup();
            const other = await createCustomer();
            const created = await placeOrder(customer, { restaurant: restaurant.id, products: [{ id: soup.id, quantity: 1 }] });

            const res = await request().get(`/api/orders/${created.body.id}`).set(auth(other.token));

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'Invalid username' });
        });

        for (const [label, id] of [['unknown', MISSING_ID], ['invalid', 'not-an-id']]) {
            test(`GET ${label} order id -> 404`, async () => {
                await setup();

                const res = await request().get(`/api/orders/${id}`).set(auth(customer.token));

                assert.equal(res.status, 404);
                assert.deepEqual(res.body, { error: 'Not Found' });
            });
        }

        test('DELETE own order -> 204, then 404', async () => {
            await setup();
            const created = await placeOrder(customer, { restaurant: restaurant.id, products: [{ id: soup.id, quantity: 1 }] });

            const res = await request().delete(`/api/orders/${created.body.id}`).set(auth(customer.token));
            const again = await request().get(`/api/orders/${created.body.id}`).set(auth(customer.token));

            assert.equal(res.status, 204);
            assert.equal(again.status, 404);
        });

        test('DELETE another user\'s order -> 404 and kept', async () => {
            await setup();
            const other = await createCustomer();
            const created = await placeOrder(customer, { restaurant: restaurant.id, products: [{ id: soup.id, quantity: 1 }] });

            const res = await request().delete(`/api/orders/${created.body.id}`).set(auth(other.token));

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'Not Found' });
            const still = await request().get(`/api/orders/${created.body.id}`).set(auth(customer.token));
            assert.equal(still.status, 200);
        });

        for (const [label, id] of [['unknown', MISSING_ID], ['invalid', 'not-an-id']]) {
            test(`DELETE ${label} order id -> 404`, async () => {
                await setup();

                const res = await request().delete(`/api/orders/${id}`).set(auth(customer.token));

                assert.equal(res.status, 404);
                assert.deepEqual(res.body, { error: 'Not Found' });
            });
        }

        test('DELETE without token -> 401', async () => {
            const res = await request().delete(`/api/orders/${MISSING_ID}`);

            assert.equal(res.status, 401);
        });
    });

    describe('token for a user that no longer exists', () => {
        test('every order route -> 404 Invalid username', async () => {
            await setup();
            const created = await placeOrder(customer, { restaurant: restaurant.id, products: [{ id: soup.id, quantity: 1 }] });
            await db.collection('users').deleteOne({ username: customer.username });

            const responses = await Promise.all([
                request().get('/api/orders').set(auth(customer.token)),
                request().get(`/api/orders/${created.body.id}`).set(auth(customer.token)),
                request().delete(`/api/orders/${created.body.id}`).set(auth(customer.token)),
                placeOrder(customer, { restaurant: restaurant.id, products: [{ id: soup.id, quantity: 1 }] }),
            ]);

            for (const res of responses) {
                assert.equal(res.status, 404, `${res.req.method} ${res.req.path}`);
                assert.deepEqual(res.body, { error: 'Invalid username' });
            }
        });
    });
});
