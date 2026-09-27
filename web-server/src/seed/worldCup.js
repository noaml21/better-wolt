const Restaurant = require('../features/restaurants/restaurant.model');

const WORLD_CUP_RESTAURANT_NAME = 'חגיגת מונדיאל';
const LEGACY_PRODUCT_NAMES = new Set([
    'חבילת מונדיאל זוגית',
    'נשנושי מחצית'
]);
const WORLD_CUP_PRODUCTS = [
    { name: 'פרנץ\' טוסט מתוק', description: 'מנה מיוחדת של צרפת לחגיגת המונדיאל', price: 30 },
    { name: 'המבורגר בווארי', description: 'מנה מיוחדת של גרמניה לחגיגת המונדיאל', price: 30 },
    { name: 'אמפנדס בקר', description: 'מנה מיוחדת של ארגנטינה לחגיגת המונדיאל', price: 30 },
    { name: 'פיצה מרגריטה', description: 'מנה מיוחדת של איטליה לחגיגת המונדיאל', price: 30 },
    { name: 'פאו דה קז\'ו', description: 'מנה מיוחדת של ברזיל לחגיגת המונדיאל', price: 30 },
    { name: 'טאקוס אל פסטור', description: 'מנה מיוחדת של מקסיקו לחגיגת המונדיאל', price: 30 },
    { name: 'פאייה פירות ים', description: 'מנה מיוחדת של ספרד לחגיגת המונדיאל', price: 30 },
    { name: 'הוט דוג קלאסי', description: 'מנה מיוחדת של ארה"ב לחגיגת המונדיאל', price: 30 },
    { name: 'סושי רול', description: 'מנה מיוחדת של יפן לחגיגת המונדיאל', price: 30 },
    { name: 'פיש אנד צ\'יפס', description: 'מנה מיוחדת של אנגליה לחגיגת המונדיאל', price: 30 },
    { name: 'פסטל דה נאטה', description: 'מנה מיוחדת של פורטוגל לחגיגת המונדיאל', price: 30 },
    { name: 'סטרופוואפל', description: 'מנה מיוחדת של הולנד לחגיגת המונדיאל', price: 30 },
    { name: 'צ\'יפס בלגי', description: 'מנה מיוחדת של בלגיה לחגיגת המונדיאל', price: 30 },
    { name: 'קערת ביבימבאפ', description: 'מנה מיוחדת של דרום קוריאה לחגיגת המונדיאל', price: 30 },
    { name: 'סובלאקי (שיפודים)', description: 'מנה מיוחדת של יוון לחגיגת המונדיאל', price: 30 },
    { name: 'כריך צ\'יביטו', description: 'מנה מיוחדת של אורוגוואי לחגיגת המונדיאל', price: 30 },
    { name: 'קוסקוס וטאג\'ין', description: 'מנה מיוחדת של מרוקו לחגיגת המונדיאל', price: 30 },
    { name: 'פונדו גבינה', description: 'מנה מיוחדת של שווייץ לחגיגת המונדיאל', price: 30 },
    { name: 'אמפנדס תירס', description: 'מנה מיוחדת של קולומביה לחגיגת המונדיאל', price: 30 },
    { name: 'קבב צ\'באפצ\'יצ\'י', description: 'מנה מיוחדת של קרואטיה לחגיגת המונדיאל', price: 30 }
];

async function seedWorldCupRestaurant() {
    let restaurant = await Restaurant.findOne({
        name: WORLD_CUP_RESTAURANT_NAME
    });

    if (!restaurant) {
        restaurant = new Restaurant({
            username: 'system',
            name: WORLD_CUP_RESTAURANT_NAME,
            phone: '',
            address: 'World Cup Special',
            image: '',
            products: []
        });
    }

    let changed = restaurant.isNew;

    for (const product of [...restaurant.products]) {
        if (LEGACY_PRODUCT_NAMES.has(product.name)) {
            product.deleteOne();
            changed = true;
        }
    }

    for (const seededProduct of WORLD_CUP_PRODUCTS) {
        const matchingProducts = restaurant.products.filter(
            product => product.name === seededProduct.name
        );
        const existingProduct = matchingProducts[0];

        if (!existingProduct) {
            restaurant.products.push(seededProduct);
            changed = true;
            continue;
        }

        if (
            existingProduct.description !== seededProduct.description
            || existingProduct.price !== seededProduct.price
        ) {
            existingProduct.description = seededProduct.description;
            existingProduct.price = seededProduct.price;
            changed = true;
        }

        for (const duplicateProduct of matchingProducts.slice(1)) {
            duplicateProduct.deleteOne();
            changed = true;
        }
    }

    if (changed) {
        await restaurant.save();
        console.log('World Cup restaurant seeded');
    }
}

module.exports = seedWorldCupRestaurant;
