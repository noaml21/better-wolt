const express = require('express');
const cors = require('cors');

const path = require('path');
const config = require('./config');
const usersRouter = require('./routes/users');
const tokensRouter = require('./routes/tokens');
const restaurantsRouter = require('./routes/restaurants');
const ordersRouter = require('./routes/orders');
const searchRouter = require('./routes/search');

const app = express();


app.use(cors({
    origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.disable('etag');
app.use(express.json({ limit: '5mb' }));

app.use('/api/users', usersRouter);
app.use('/api/tokens', tokensRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/search', searchRouter);

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

module.exports = app;