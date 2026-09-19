// The only module that reads process.env. server.js loads .env (dotenv)
// before anything requires this file.

const DEFAULT_CORS_ORIGINS =
    'http://localhost:3000,http://localhost:8080,http://localhost:8081,http://localhost:19006';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
}

// bcrypt cost factor. Production keeps the default; the test suite lowers it
// because each hash at cost 12 takes ~0.7 s with bcryptjs.
const bcryptRounds = Number(process.env.BCRYPT_ROUNDS || 12);

if (!Number.isInteger(bcryptRounds) || bcryptRounds < 4 || bcryptRounds > 31) {
    throw new Error('BCRYPT_ROUNDS must be an integer between 4 and 31');
}

module.exports = {
    port: process.env.PORT || 8080,
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/better_wolt',
    jwtSecret,
    corsOrigins: (process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS)
        .split(',')
        .map((origin) => origin.trim()),
    bcryptRounds,
};
