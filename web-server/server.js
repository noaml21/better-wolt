require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/db');
const seedWorldCupRestaurant = require('./src/seed/worldCup');

async function startServer() {
    try {
        await connectDB();
        await seedWorldCupRestaurant();

        app.listen(config.port, () => {
            console.log(`Better Wolt API listening on port ${config.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
