// Local demo data for V3 visual work. Talks to the API over HTTP only.
const BASE = 'http://localhost:8080/api';

async function api(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function ensureUser(u) {
  try { await api('/users', 'POST', u); } catch (e) { if (!String(e.message).includes('Username already taken')) throw e; }
  const login = await api('/tokens', 'POST', { username: u.username, password: u.password });
  return login.token;
}

const owner = { username: 'chef', password: 'chefpass1', displayName: 'דנה כהן', email: 'chef@example.com', address: 'דיזנגוף 100, תל אביב', role: 'restaurant' };
const customer = { username: 'noam', password: 'noampass1', displayName: 'נועם לוי', email: 'noam@example.com', address: 'הרצל 5, רמת גן', role: 'customer' };

const restaurants = [
  { name: 'גולדה גלידה', phone: '03-5551234', address: 'שינקין 21, תל אביב',
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
    products: [
      { name: 'גלידת פיסטוק', description: 'פיסטוק חלבי אמיתי, גרעינים קלויים', price: 28 },
      { name: 'גלידת שוקולד בלגי', description: 'שוקולד 70% עם שבבי קקאו', price: 28 },
      { name: 'סורבה מנגו', description: 'פרווה, מנגו טרי בלבד', price: 26 },
      { name: 'מילקשייק וניל', description: 'שייק סמיך עם קצפת', price: 34 },
      { name: 'אפוגטו', description: 'אספרסו חם על גלידת וניל', price: 32 },
    ] },
  { name: 'המבורגר בר', phone: '03-5559876', address: 'אבן גבירול 44, תל אביב',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    products: [
      { name: 'המבורגר קלאסי', description: '220 גרם אנטריקוט, חסה, עגבנייה, רוטב הבית', price: 62 },
      { name: 'צ׳יזבורגר כפול', description: 'שתי קציצות, צ׳דר מותך, בצל מקורמל', price: 78 },
      { name: 'המבורגר פטריות', description: 'פטריות מוקפצות, גבינת שמנת, רוקט', price: 69 },
      { name: 'צ׳יפס בטטה', description: 'עם איולי שום ועשבי תיבול', price: 24 },
      { name: 'טבעות בצל', description: 'פריכות, עם רוטב ברביקיו מעושן', price: 22 },
      { name: 'שייק שוקולד', description: 'שוקולד בלגי, קצפת, שבבי שוקולד', price: 26 },
    ] },
  { name: 'פסטה פרסקה', phone: '03-5552211', address: 'נחלת בנימין 7, תל אביב',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
    products: [
      { name: 'קצ׳ו א פפה', description: 'פקורינו רומנו ופלפל שחור גרוס', price: 68 },
      { name: 'רביולי תרד וריקוטה', description: 'ברוטב חמאה ומרווה', price: 74 },
      { name: 'לזניה בולונז', description: 'רוטב בשר איטי, בשמל, פרמזן', price: 79 },
      { name: 'סלט קפרזה', description: 'מוצרלה טרייה, עגבניות שרי, בזיליקום', price: 46 },
      { name: 'טירמיסו', description: 'מסקרפונה, אספרסו, קקאו', price: 38 },
    ] },
  { name: 'סושי קיוטו', phone: '03-5557788', address: 'רוטשילד 30, תל אביב',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    products: [
      { name: 'מגש סלמון 16 יח׳', description: 'ספייסי סלמון, סלמון אבוקדו, פילדלפיה', price: 128 },
      { name: 'ניגירי טונה', description: 'שתי יחידות, טונה אדומה', price: 34 },
      { name: 'אורז חום קריספי', description: 'עם סלמון צרוב ורוטב יוזו', price: 58 },
      { name: 'מרק מיסו', description: 'טופו, אצות ובצל ירוק', price: 22 },
      { name: 'אדממה', description: 'מאודה, מלח ים', price: 24 },
    ] },
  { name: 'חומוס אליהו', phone: '03-5554433', address: 'לוינסקי 12, תל אביב',
    image: 'https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=800&q=80',
    products: [
      { name: 'חומוס פול', description: 'עם ביצה קשה, זעתר ושמן זית', price: 34 },
      { name: 'חומוס פטריות', description: 'פטריות מוקפצות בשום ופטרוזיליה', price: 38 },
      { name: 'מסבחה', description: 'גרגרים שלמים, לימון וכמון', price: 36 },
      { name: 'פלאפל 6 יח׳', description: 'טרי מהמחבת עם טחינה', price: 18 },
    ] },
  { name: 'פיצה נאפולי', phone: '03-5556677', address: 'בן יהודה 88, תל אביב',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    products: [
      { name: 'מרגריטה', description: 'רוטב עגבניות סן מרצאנו, מוצרלה, בזיליקום', price: 56 },
      { name: 'פפרוני', description: 'פפרוני חריף, מוצרלה, אורגנו', price: 66 },
      { name: 'קוואטרו פורמאג׳י', description: 'ארבע גבינות ודבש', price: 72 },
      { name: 'פוקצ׳ה שום', description: 'שמן זית, שום קונפי, רוזמרין', price: 28 },
    ] },
  { name: 'גרין בול', phone: '03-5551188', address: 'קינג ג׳ורג׳ 55, תל אביב',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    products: [
      { name: 'באדי בול קינואה', description: 'קינואה, בטטה, אבוקדו, טחינה', price: 58 },
      { name: 'סלט סיזר עוף', description: 'חזה עוף צרוב, קרוטונים, פרמזן', price: 62 },
      { name: 'שייק ירוק', description: 'תרד, תפוח, ג׳ינג׳ר, לימון', price: 28 },
      { name: 'טוסט אבוקדו', description: 'לחם מחמצת, ביצה עלומה, צ׳ילי', price: 44 },
    ] },
];

const ownerToken = await ensureUser(owner);
const customerToken = await ensureUser(customer);

const existing = await api('/restaurants');
const byName = new Map(existing.map(r => [r.name, r]));

const created = [];
for (const r of restaurants) {
  let rest = byName.get(r.name);
  if (!rest) {
    rest = await api('/restaurants', 'POST', { name: r.name, phone: r.phone, address: r.address, image: r.image }, ownerToken);
  }
  const menu = await api(`/restaurants/${rest.id}/products`);
  for (const p of r.products) {
    if (!menu.some(m => m.name === p.name)) {
      await api(`/restaurants/${rest.id}/products`, 'POST', p, ownerToken);
    }
  }
  created.push(rest);
}

// A couple of orders for the customer, so order history is not empty.
const orders = await api('/orders', 'GET', null, customerToken);
if (orders.length < 2) {
  const burger = created.find(r => r.name === 'המבורגר בר');
  const burgerMenu = await api(`/restaurants/${burger.id}/products`);
  await api('/orders', 'POST', { restaurant: burger.id, products: [
    { id: burgerMenu[0].id, quantity: 2 }, { id: burgerMenu[3].id, quantity: 1 },
  ] }, customerToken);
  const sushi = created.find(r => r.name === 'סושי קיוטו');
  const sushiMenu = await api(`/restaurants/${sushi.id}/products`);
  await api('/orders', 'POST', { restaurant: sushi.id, products: [
    { id: sushiMenu[0].id, quantity: 1 }, { id: sushiMenu[3].id, quantity: 2 },
  ] }, customerToken);
}

console.log('restaurants:', (await api('/restaurants')).length);
console.log('customer orders:', (await api('/orders', 'GET', null, customerToken)).length);
console.log('logins: customer noam/noampass1 · owner chef/chefpass1');
