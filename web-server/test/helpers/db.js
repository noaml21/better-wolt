const crypto = require('crypto');
const mongoose = require('mongoose');

// Every test file runs in its own process with its own database, so files can
// run in parallel. The prefix guard makes it impossible to point the suite at a
// real database and wipe it.
function assertTestDbName(name) {
    if (!/^bw_test_/.test(String(name))) {
        throw new Error(`Refusing to use non-test database "${name}"`);
    }
}

async function connect() {
    const dbName = `bw_test_${process.pid}_${crypto.randomBytes(3).toString('hex')}`;
    assertTestDbName(dbName);

    await mongoose.connect(process.env.MONGODB_URI, { dbName });
    assertTestDbName(mongoose.connection.db.databaseName);

    // Make sure unique indexes exist before tests rely on them.
    await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

async function clear() {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

async function close() {
    if (mongoose.connection.readyState === 1) {
        assertTestDbName(mongoose.connection.db.databaseName);
        await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
}

// Raw collection access, for test SETUP ONLY where no API exists
// (for example deleting a user).
function collection(name) {
    return mongoose.connection.db.collection(name);
}

module.exports = {
    assertTestDbName,
    connect,
    clear,
    close,
    collection,
};
