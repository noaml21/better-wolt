require('./helpers/env');
const { describe, test, before, after, afterEach } = require('node:test');
const assert = require('assert/strict');
const db = require('./helpers/db');
const {
    request,
    auth,
    uniqueName,
    createCustomer,
    createOwner,
    createRestaurantAs,
    addProductAs,
} = require('./helpers/api');

const BAD_ID = 'not-an-id';
const MISSING_ID = '64b000000000000000000000';

describe('restaurants and products', () => {
    let owner;
    let otherOwner;
    let customer;

    before(db.connect);
    afterEach(db.clear);
    after(db.close);

    // Users are cleared after each test, so create fresh ones per test.
    async function actors() {
        owner = await createOwner();
        otherOwner = await createOwner();
        customer = await createCustomer();
    }

    describe('restaurants', () => {
        test('create as owner -> 201 with full shape and Location', async () => {
            await actors();

            const res = await request()
                .post('/api/restaurants')
                .set(auth(owner.token))
                .send({ name: 'Pizza Place', phone: '050', address: 'Main St', image: 'http://img' });

            assert.equal(res.status, 201);
            assert.equal(res.headers.location, `/api/restaurants/${res.body.id}`);
            assert.deepEqual(res.body, {
                id: res.body.id,
                username: owner.username,
                name: 'Pizza Place',
                phone: '050',
                address: 'Main St',
                image: 'http://img',
                products: [],
            });
        });

        test('optional fields default to empty strings', async () => {
            await actors();

            const res = await request().post('/api/restaurants').set(auth(owner.token)).send({ name: 'Bare' });

            assert.equal(res.status, 201);
            assert.equal(res.body.phone, '');
            assert.equal(res.body.address, '');
            assert.equal(res.body.image, '');
        });

        test('client cannot choose the owner username', async () => {
            await actors();

            const res = await request()
                .post('/api/restaurants')
                .set(auth(owner.token))
                .send({ name: 'Mine', username: otherOwner.username });

            assert.equal(res.status, 201);
            assert.equal(res.body.username, owner.username);
        });

        test('create as customer -> 403', async () => {
            await actors();

            const res = await request().post('/api/restaurants').set(auth(customer.token)).send({ name: 'Nope' });

            assert.equal(res.status, 403);
            assert.deepEqual(res.body, { error: 'Only restaurant owners can create restaurants' });
        });

        test('create without token -> 401', async () => {
            const res = await request().post('/api/restaurants').send({ name: 'Nope' });

            assert.equal(res.status, 401);
        });

        test('create without name -> 400', async () => {
            await actors();

            const res = await request().post('/api/restaurants').set(auth(owner.token)).send({ phone: '1' });

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Name is required' });
        });

        test('[BF-4] non-string restaurant fields -> 400', async () => {
            await actors();

            for (const field of ['name', 'phone', 'address', 'image']) {
                const res = await request()
                    .post('/api/restaurants')
                    .set(auth(owner.token))
                    .send({ name: 'Ok', [field]: 42 });

                assert.equal(res.status, 400, field);
                assert.deepEqual(res.body, { error: `${field} must be a string` });
            }
        });

        test('[BF-4] update without body -> 400 (was 400 with a JavaScript TypeError message)', async () => {
            await actors();
            const created = await createRestaurantAs(owner);

            const res = await request().patch(`/api/restaurants/${created.id}`).set(auth(owner.token));

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Missing required field: body' });
        });

        test('duplicate name -> 400', async () => {
            await actors();
            await createRestaurantAs(owner, { name: 'Taken' });

            const res = await request().post('/api/restaurants').set(auth(otherOwner.token)).send({ name: 'Taken' });

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Restaurant with this name already exists' });
        });

        test('list and get return the same shape, publicly', async () => {
            await actors();
            const created = await createRestaurantAs(owner);
            await addProductAs(owner, created.id, { name: 'Soup', description: 'Hot', price: 12.5 });

            const list = await request().get('/api/restaurants');
            const one = await request().get(`/api/restaurants/${created.id}`);

            assert.equal(list.status, 200);
            assert.equal(one.status, 200);
            assert.equal(list.body.length, 1);
            assert.deepEqual(list.body[0], one.body);
            assert.deepEqual(Object.keys(one.body).sort(), ['address', 'id', 'image', 'name', 'phone', 'products', 'username']);
            assert.deepEqual(one.body.products.map(({ name, description, price }) => ({ name, description, price })), [
                { name: 'Soup', description: 'Hot', price: 12.5 },
            ]);
        });

        test('get unknown id -> 404', async () => {
            const res = await request().get(`/api/restaurants/${MISSING_ID}`);

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'Restaurant not found' });
        });

        test('update as owner -> 204 and persisted', async () => {
            await actors();
            const created = await createRestaurantAs(owner);

            const res = await request()
                .patch(`/api/restaurants/${created.id}`)
                .set(auth(owner.token))
                .send({ name: 'Renamed', phone: '999', address: 'New St', image: 'http://new' });

            assert.equal(res.status, 204);
            assert.equal(res.text, '');
            const after = await request().get(`/api/restaurants/${created.id}`);
            assert.equal(after.body.name, 'Renamed');
            assert.equal(after.body.phone, '999');
            assert.equal(after.body.address, 'New St');
            assert.equal(after.body.image, 'http://new');
            assert.equal(after.body.username, owner.username);
        });

        test('update by another owner -> 403', async () => {
            await actors();
            const created = await createRestaurantAs(owner);

            const res = await request()
                .patch(`/api/restaurants/${created.id}`)
                .set(auth(otherOwner.token))
                .send({ name: 'Stolen' });

            assert.equal(res.status, 403);
            assert.deepEqual(res.body, { error: 'Forbidden' });
            const after = await request().get(`/api/restaurants/${created.id}`);
            assert.equal(after.body.name, created.name);
        });

        test('update by a customer -> 403', async () => {
            await actors();
            const created = await createRestaurantAs(owner);

            const res = await request()
                .patch(`/api/restaurants/${created.id}`)
                .set(auth(customer.token))
                .send({ name: 'Stolen' });

            assert.equal(res.status, 403);
        });

        test('update without token -> 401', async () => {
            await actors();
            const created = await createRestaurantAs(owner);

            const res = await request().patch(`/api/restaurants/${created.id}`).send({ name: 'x' });

            assert.equal(res.status, 401);
        });

        test('update unknown id -> 404', async () => {
            await actors();

            const res = await request().patch(`/api/restaurants/${MISSING_ID}`).set(auth(owner.token)).send({ name: 'x' });

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'Restaurant not found' });
        });

        test('update to a taken name -> 400', async () => {
            await actors();
            await createRestaurantAs(otherOwner, { name: 'Taken' });
            const created = await createRestaurantAs(owner);

            const res = await request()
                .patch(`/api/restaurants/${created.id}`)
                .set(auth(owner.token))
                .send({ name: 'Taken' });

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Restaurant with this name already exists' });
        });

        test('delete as owner -> 204, then 404', async () => {
            await actors();
            const created = await createRestaurantAs(owner);

            const res = await request().delete(`/api/restaurants/${created.id}`).set(auth(owner.token));

            assert.equal(res.status, 204);
            assert.equal((await request().get(`/api/restaurants/${created.id}`)).status, 404);
        });

        test('delete by another owner -> 403 and kept', async () => {
            await actors();
            const created = await createRestaurantAs(owner);

            const res = await request().delete(`/api/restaurants/${created.id}`).set(auth(otherOwner.token));

            assert.equal(res.status, 403);
            assert.equal((await request().get(`/api/restaurants/${created.id}`)).status, 200);
        });

        test('delete unknown id -> 404', async () => {
            await actors();

            const res = await request().delete(`/api/restaurants/${MISSING_ID}`).set(auth(owner.token));

            assert.equal(res.status, 404);
        });
    });

    describe('products', () => {
        test('add as owner -> 201 with shape and Location', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);

            const res = await request()
                .post(`/api/restaurants/${restaurant.id}/products`)
                .set(auth(owner.token))
                .send({ name: 'Falafel', description: 'Crispy', price: '18' });

            assert.equal(res.status, 201);
            assert.equal(res.headers.location, `/api/restaurants/${restaurant.id}/products/${res.body.id}`);
            assert.deepEqual(res.body, { id: res.body.id, name: 'Falafel', description: 'Crispy', price: 18 });
        });

        test('description defaults to empty string', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);

            const res = await request()
                .post(`/api/restaurants/${restaurant.id}/products`)
                .set(auth(owner.token))
                .send({ name: 'Plain', price: 5 });

            assert.equal(res.status, 201);
            assert.equal(res.body.description, '');
        });

        for (const body of [{ price: 5 }, { name: 'No price' }]) {
            test(`add with missing field ${JSON.stringify(body)} -> 400`, async () => {
                await actors();
                const restaurant = await createRestaurantAs(owner);

                const res = await request()
                    .post(`/api/restaurants/${restaurant.id}/products`)
                    .set(auth(owner.token))
                    .send(body);

                assert.equal(res.status, 400);
                assert.deepEqual(res.body, { error: 'Missing required fields: name, price' });
            });
        }

        test('add by another owner -> 403', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);

            const res = await request()
                .post(`/api/restaurants/${restaurant.id}/products`)
                .set(auth(otherOwner.token))
                .send({ name: 'Sneaky', price: 1 });

            assert.equal(res.status, 403);
            assert.deepEqual(res.body, { error: 'Forbidden' });
        });

        test('add without token -> 401', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);

            const res = await request().post(`/api/restaurants/${restaurant.id}/products`).send({ name: 'x', price: 1 });

            assert.equal(res.status, 401);
        });

        test('add to unknown restaurant -> 404', async () => {
            await actors();

            const res = await request()
                .post(`/api/restaurants/${MISSING_ID}/products`)
                .set(auth(owner.token))
                .send({ name: 'x', price: 1 });

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'Restaurant not found' });
        });

        test('menu and single product are public', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);
            const product = await addProductAs(owner, restaurant.id, { name: 'Soup', description: 'Hot', price: 12 });

            const menu = await request().get(`/api/restaurants/${restaurant.id}/products`);
            const one = await request().get(`/api/restaurants/${restaurant.id}/products/${product.id}`);

            assert.equal(menu.status, 200);
            assert.deepEqual(menu.body, [product]);
            assert.equal(one.status, 200);
            assert.deepEqual(one.body, product);
        });

        test('menu of unknown restaurant -> 404', async () => {
            const res = await request().get(`/api/restaurants/${MISSING_ID}/products`);

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'Restaurant not found' });
        });

        test('unknown product -> 404 on get, update and delete', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);
            const path = `/api/restaurants/${restaurant.id}/products/${MISSING_ID}`;

            const get = await request().get(path);
            const patch = await request().patch(path).set(auth(owner.token)).send({ price: 1 });
            const del = await request().delete(path).set(auth(owner.token));

            for (const res of [get, patch, del]) {
                assert.equal(res.status, 404);
                assert.deepEqual(res.body, { error: 'Product not found' });
            }
        });

        test('invalid product id under a valid restaurant -> 404', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);

            const res = await request().get(`/api/restaurants/${restaurant.id}/products/${BAD_ID}`);

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'Product not found' });
        });

        test('update as owner -> 200 with the updated product', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);
            const product = await addProductAs(owner, restaurant.id, { name: 'Old', description: 'd', price: 10 });

            const res = await request()
                .patch(`/api/restaurants/${restaurant.id}/products/${product.id}`)
                .set(auth(owner.token))
                .send({ name: 'New', price: '11.5' });

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { id: product.id, name: 'New', description: 'd', price: 11.5 });
        });

        test('update by another owner -> 403 and unchanged', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);
            const product = await addProductAs(owner, restaurant.id, { price: 10 });

            const res = await request()
                .patch(`/api/restaurants/${restaurant.id}/products/${product.id}`)
                .set(auth(otherOwner.token))
                .send({ price: 1 });

            assert.equal(res.status, 403);
            const after = await request().get(`/api/restaurants/${restaurant.id}/products/${product.id}`);
            assert.equal(after.body.price, 10);
        });

        test('update without body -> 400', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);
            const product = await addProductAs(owner, restaurant.id);

            const res = await request()
                .patch(`/api/restaurants/${restaurant.id}/products/${product.id}`)
                .set(auth(owner.token));

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Missing required field: body' });
        });

        test('delete as owner -> 204 and gone', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);
            const product = await addProductAs(owner, restaurant.id);

            const res = await request()
                .delete(`/api/restaurants/${restaurant.id}/products/${product.id}`)
                .set(auth(owner.token));

            assert.equal(res.status, 204);
            const after = await request().get(`/api/restaurants/${restaurant.id}/products/${product.id}`);
            assert.equal(after.status, 404);
        });

        test('delete by another owner or a customer -> 403 and kept', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);
            const product = await addProductAs(owner, restaurant.id);
            const path = `/api/restaurants/${restaurant.id}/products/${product.id}`;

            for (const actor of [otherOwner, customer]) {
                const res = await request().delete(path).set(auth(actor.token));
                assert.equal(res.status, 403);
            }
            assert.equal((await request().get(path)).status, 200);
        });

        // Regression: was 201 with price -5 stored
        test('[BF-4] negative price -> 400', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);

            const res = await request()
                .post(`/api/restaurants/${restaurant.id}/products`)
                .set(auth(owner.token))
                .send({ name: 'Free money', price: -5 });

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Price must be a non-negative number' });
        });

        // Regression: was 500 (NaN rejected by Mongoose on save)
        test('[BF-4] non-numeric price on create -> 400', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);

            const res = await request()
                .post(`/api/restaurants/${restaurant.id}/products`)
                .set(auth(owner.token))
                .send({ name: 'Bad', price: 'abc' });

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'Price must be a non-negative number' });
        });

        // Regression: was 500 (NaN rejected by Mongoose on save)
        test('[BF-4] non-numeric or negative price on update -> 400 and unchanged', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);
            const product = await addProductAs(owner, restaurant.id, { price: 10 });
            const path = `/api/restaurants/${restaurant.id}/products/${product.id}`;

            for (const price of ['abc', -1]) {
                const res = await request().patch(path).set(auth(owner.token)).send({ price });

                assert.equal(res.status, 400, String(price));
                assert.deepEqual(res.body, { error: 'Price must be a non-negative number' });
            }
            assert.equal((await request().get(path)).body.price, 10);
        });

        test('[BF-4] non-string product name or description -> 400', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);

            for (const [body, error] of [
                [{ name: { a: 1 }, price: 1 }, 'name must be a string'],
                [{ name: 'Ok', price: 1, description: 5 }, 'description must be a string'],
            ]) {
                const res = await request()
                    .post(`/api/restaurants/${restaurant.id}/products`)
                    .set(auth(owner.token))
                    .send(body);

                assert.equal(res.status, 400);
                assert.deepEqual(res.body, { error });
            }
        });
    });

    describe('invalid ObjectId in the path', () => {
        test('GET /restaurants/:id -> 404', async () => {
            const res = await request().get(`/api/restaurants/${BAD_ID}`);

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'Restaurant not found' });
        });

        // Regression: was 400 with the raw Mongoose CastError text
        test('[BF-3] PATCH /restaurants/:id -> 404, no driver text', async () => {
            await actors();

            const res = await request().patch(`/api/restaurants/${BAD_ID}`).set(auth(owner.token)).send({ name: 'x' });

            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { error: 'Restaurant not found' });
        });

        // Regression: these were 500 Error processing request
        test('[BF-3] other restaurant/product routes -> 404 with the missing-document message', async () => {
            await actors();
            const product = { name: uniqueName('Dish'), price: 1 };
            const cases = [
                ['Restaurant not found', request().get(`/api/restaurants/${BAD_ID}/products`)],
                ['Product not found', request().get(`/api/restaurants/${BAD_ID}/products/${MISSING_ID}`)],
                ['Restaurant not found', request().delete(`/api/restaurants/${BAD_ID}`).set(auth(owner.token))],
                ['Restaurant not found', request().post(`/api/restaurants/${BAD_ID}/products`).set(auth(owner.token)).send(product)],
                ['Restaurant not found', request().patch(`/api/restaurants/${BAD_ID}/products/${MISSING_ID}`).set(auth(owner.token)).send({ price: 1 })],
                ['Restaurant not found', request().delete(`/api/restaurants/${BAD_ID}/products/${MISSING_ID}`).set(auth(owner.token))],
            ];

            // Settle every request first: supertest opens a server per request and only
            // closes it once awaited, so asserting mid-loop would leak open servers.
            const responses = await Promise.all(cases.map(([, pending]) => pending));

            for (const [index, res] of responses.entries()) {
                const [message] = cases[index];
                assert.equal(res.status, 404, `${res.req.method} ${res.req.path}`);
                assert.deepEqual(res.body, { error: message }, `${res.req.method} ${res.req.path}`);
            }
        });

        test('[BF-3] invalid product id under a valid restaurant -> 404 on every product route', async () => {
            await actors();
            const restaurant = await createRestaurantAs(owner);
            const path = `/api/restaurants/${restaurant.id}/products/${BAD_ID}`;

            for (const res of [
                await request().get(path),
                await request().patch(path).set(auth(owner.token)).send({ price: 1 }),
                await request().delete(path).set(auth(owner.token)),
            ]) {
                assert.equal(res.status, 404, res.req.method);
                assert.deepEqual(res.body, { error: 'Product not found' });
            }
        });
    });
});
