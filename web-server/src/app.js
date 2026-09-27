const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const path = require('path');
const config = require('./config');
const { AppError } = require('./http/errors');
const { apiNotFound, errorHandler } = require('./http/errorHandler');
const usersRouter = require('./features/users/users.routes');
const tokensRouter = require('./features/auth/auth.routes');
const restaurantsRouter = require('./features/restaurants/restaurants.routes');
const ordersRouter = require('./features/orders/orders.routes');
const searchRouter = require('./features/search/search.routes');

const app = express();


app.use(cors({
    origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new AppError(403, 'Origin not allowed'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.disable('etag');
// Registration may carry a base64 avatar, so only that route gets a large
// body limit; it is registered first, and the global parser then skips the
// already-parsed body. Everything else uses the 100 KB default.
app.post('/api/users', express.json({ limit: '5mb' }));
app.use(express.json());

// Liveness/readiness for Docker and Compose: the API is only useful with a
// live database connection.
app.get('/api/health', (req, res) => {
    const connected = mongoose.connection.readyState === 1;

    return res
        .status(connected ? 200 : 503)
        .json({ status: connected ? 'ok' : 'unavailable' });
});

app.use('/api/users', usersRouter);
app.use('/api/tokens', tokensRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/search', searchRouter);
app.use('/api', apiNotFound);

app.use((req, res, next) => {
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=5');
    next();
});

// 1. הגשת הקבצים הסטטיים מתוך תיקיית ה-build (ולא public)
app.use(express.static(path.join(__dirname, '../client/build')));

// 2. ה-Catch-all Route: תופס כל נתיב שלא נמצא ומחזיר את אפליקציית ה-React
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.use(errorHandler);

module.exports = app;