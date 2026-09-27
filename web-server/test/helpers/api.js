const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const supertest = require('supertest');
const app = require('../../src/app');

const PASSWORD = 'password123';
let counter = 0;

function request() {
    return supertest(app);
}

function auth(token) {
    return { Authorization: `Bearer ${token}` };
}

function uniqueName(prefix) {
    counter += 1;
    return `${prefix}_${process.pid}_${counter}`;
}

async function registerUser(overrides = {}) {
    const body = {
        username: uniqueName('user'),
        password: PASSWORD,
        displayName: 'Test User',
        address: '1 Test Street',
        email: 'test@example.com',
        ...overrides,
    };

    const res = await request().post('/api/users').send(body);
    assert.equal(res.status, 201, `registerUser failed: ${res.status} ${JSON.stringify(res.body)}`);

    return { id: res.body.id, username: body.username, password: body.password };
}

async function loginAs(username, password = PASSWORD) {
    const res = await request().post('/api/tokens').send({ username, password });
    assert.equal(res.status, 200, `loginAs failed: ${res.status} ${JSON.stringify(res.body)}`);

    return res.body;
}

async function createCustomer(overrides = {}) {
    const registered = await registerUser(overrides);
    const { token, user } = await loginAs(registered.username, registered.password);

    return { id: registered.id, username: registered.username, token, user };
}

function createOwner(overrides = {}) {
    return createCustomer({ role: 'restaurant', ...overrides });
}

async function createRestaurantAs(owner, overrides = {}) {
    const res = await request()
        .post('/api/restaurants')
        .set(auth(owner.token))
        .send({ name: uniqueName('Restaurant'), phone: '050', address: 'Main St', ...overrides });
    assert.equal(res.status, 201, `createRestaurantAs failed: ${res.status} ${JSON.stringify(res.body)}`);

    return res.body;
}

async function addProductAs(owner, restaurantId, overrides = {}) {
    const res = await request()
        .post(`/api/restaurants/${restaurantId}/products`)
        .set(auth(owner.token))
        .send({ name: uniqueName('Dish'), description: 'Tasty', price: 10, ...overrides });
    assert.equal(res.status, 201, `addProductAs failed: ${res.status} ${JSON.stringify(res.body)}`);

    return res.body;
}

// The app serves client/build as the SPA. Tests that exercise the SPA fallback
// need an index.html there; create one only if no real build exists and remove
// only what was created.
function ensureClientBuildFixture() {
    const buildDir = path.join(__dirname, '../../client/build');
    const indexFile = path.join(buildDir, 'index.html');

    if (fs.existsSync(indexFile)) {
        return () => {};
    }

    const createdDir = !fs.existsSync(buildDir);
    fs.mkdirSync(buildDir, { recursive: true });
    fs.writeFileSync(indexFile, '<!doctype html><html><body>test spa</body></html>');

    return () => {
        fs.rmSync(indexFile, { force: true });
        if (createdDir) {
            fs.rmSync(buildDir, { recursive: true, force: true });
        }
    };
}

module.exports = {
    PASSWORD,
    request,
    auth,
    uniqueName,
    registerUser,
    loginAs,
    createCustomer,
    createOwner,
    createRestaurantAs,
    addProductAs,
    ensureClientBuildFixture,
};
