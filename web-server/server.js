require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const seedWorldCupRestaurant = require('./src/services/seedWorldCupRestaurant');

const PORT = process.env.PORT || 8080;

async function startServer() {
    try {
        await connectDB();
        await seedWorldCupRestaurant();

        app.listen(PORT, () => {
            console.log(`Better Wolt API listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
