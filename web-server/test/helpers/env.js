// Require this first in every test file, before anything that loads the app:
// the app reads its configuration from process.env at require time.
process.env.JWT_SECRET = 'test-secret';
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27018/better_wolt_test';
// Cheap password hashing keeps the suite fast; production uses the default 12.
process.env.BCRYPT_ROUNDS = '4';

// Keep the auth rate limiter (Phase 3) out of the way unless a test sets it.
if (!process.env.AUTH_RATE_LIMIT_MAX) {
    process.env.AUTH_RATE_LIMIT_MAX = '1000';
}
