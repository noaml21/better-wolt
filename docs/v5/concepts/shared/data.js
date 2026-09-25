/* Concept prototypes only — never imported by the production clients.
   Real Better Wolt demo content (docs/dev/demo-data.mjs), the seeded World Cup
   restaurant, and three hostile cases: no photo, a photo that fails to load,
   and a long mixed Hebrew/Latin name. Ratings, times and fees are derived from
   the id exactly as the production client does (illustrative, never sent). */

const U = (id, w = 1600) => `https://images.unsplash.com/${id}?w=${w}&q=80`;

window.BW_DATA = (function () {
  const restaurants = [
    { id: 'r-burger', name: 'המבורגר בר', address: 'אבן גבירול 44, תל אביב', phone: '03-5559876',
      image: U('photo-1568901346375-23c9450c58cd'), products: [
        ['המבורגר קלאסי', '220 גרם אנטריקוט, חסה, עגבנייה, רוטב הבית', 62],
        ['צ׳יזבורגר כפול', 'שתי קציצות, צ׳דר מותך, בצל מקורמל', 78],
        ['המבורגר פטריות', 'פטריות מוקפצות, גבינת שמנת, רוקט', 69],
        ['צ׳יפס בטטה', 'עם איולי שום ועשבי תיבול', 24],
        ['טבעות בצל', 'פריכות, עם רוטב ברביקיו מעושן', 22],
        ['שייק שוקולד', 'שוקולד בלגי, קצפת, שבבי שוקולד', 26],
      ] },
    { id: 'r-sushi', name: 'סושי קיוטו', address: 'רוטשילד 30, תל אביב', phone: '03-5557788',
      image: U('photo-1579871494447-9811cf80d66c'), products: [
        ['מגש סלמון 16 יח׳', 'ספייסי סלמון, סלמון אבוקדו, פילדלפיה', 128],
        ['ניגירי טונה', 'שתי יחידות, טונה אדומה', 34],
        ['אורז חום קריספי', 'עם סלמון צרוב ורוטב יוזו', 58],
        ['מרק מיסו', 'טופו, אצות ובצל ירוק', 22],
        ['אדממה', 'מאודה, מלח ים', 24],
      ] },
    { id: 'r-pasta', name: 'פסטה פרסקה', address: 'נחלת בנימין 7, תל אביב', phone: '03-5552211',
      image: U('photo-1551183053-bf91a1d81141'), products: [
        ['קצ׳ו א פפה', 'פקורינו רומנו ופלפל שחור גרוס', 68],
        ['רביולי תרד וריקוטה', 'ברוטב חמאה ומרווה', 74],
        ['לזניה בולונז', 'רוטב בשר איטי, בשמל, פרמזן', 79],
        ['סלט קפרזה', 'מוצרלה טרייה, עגבניות שרי, בזיליקום', 46],
        ['טירמיסו', 'מסקרפונה, אספרסו, קקאו', 38],
      ] },
    { id: 'r-gelato', name: 'גולדה גלידה', address: 'שינקין 21, תל אביב', phone: '03-5551234',
      image: U('photo-1497034825429-c343d7c6a68f'), products: [
        ['גלידת פיסטוק', 'פיסטוק חלבי אמיתי, גרעינים קלויים', 28],
        ['גלידת שוקולד בלגי', 'שוקולד 70% עם שבבי קקאו', 28],
        ['סורבה מנגו', 'פרווה, מנגו טרי בלבד', 26],
        ['מילקשייק וניל', 'שייק סמיך עם קצפת', 34],
        ['אפוגטו', 'אספרסו חם על גלידת וניל', 32],
      ] },
    { id: 'r-pizza', name: 'פיצה נאפולי', address: 'בן יהודה 88, תל אביב', phone: '03-5556677',
      image: U('photo-1513104890138-7c749659a591'), products: [
        ['מרגריטה', 'רוטב עגבניות סן מרצאנו, מוצרלה, בזיליקום', 56],
        ['פפרוני', 'פפרוני חריף, מוצרלה, אורגנו', 66],
        ['קוואטרו פורמאג׳י', 'ארבע גבינות ודבש', 72],
        ['פוקצ׳ה שום', 'שמן זית, שום קונפי, רוזמרין', 28],
      ] },
    { id: 'r-green', name: 'גרין בול', address: 'קינג ג׳ורג׳ 55, תל אביב', phone: '03-5551188',
      image: U('photo-1512621776951-a57141f2eefd'), products: [
        ['באדי בול קינואה', 'קינואה, בטטה, אבוקדו, טחינה', 58],
        ['סלט סיזר עוף', 'חזה עוף צרוב, קרוטונים, פרמזן', 62],
        ['שייק ירוק', 'תרד, תפוח, ג׳ינג׳ר, לימון', 28],
        ['טוסט אבוקדו', 'לחם מחמצת, ביצה עלומה, צ׳ילי', 44],
      ] },
    // A photo URL that fails: the concept must show its designed fallback.
    { id: 'r-hummus', name: 'חומוס אליהו', address: 'לוינסקי 12, תל אביב', phone: '03-5554433',
      image: 'https://images.unsplash.com/photo-0000000000000-broken?w=1600', products: [
        ['חומוס פול', 'עם ביצה קשה, זעתר ושמן זית', 34],
        ['חומוס פטריות', 'פטריות מוקפצות בשום ופטרוזיליה', 38],
        ['מסבחה', 'גרגרים שלמים, לימון וכמון', 36],
        ['פלאפל 6 יח׳', 'טרי מהמחבת עם טחינה', 18],
      ] },
    // No photo at all, a long mixed-direction name and a four-digit price.
    { id: 'r-smoke', name: 'Smoke מעשנת הדרום — BBQ & Craft Beer', address: 'הרכבת 19, תל אביב', phone: '',
      image: '', products: [
        ['Brisket 12h ברוטב קפה', 'בריסקט מעושן 12 שעות, רוטב קפה וצ׳ילי צ׳יפוטלה, כרוב כבוש של הבית', 94],
        ['מגש מעשנה לארבעה', 'בריסקט, צלעות, נקניקיות הבית, תוספות', 1240],
        ['כנפיים מעושנות', 'רוטב ברביקיו מעושן', 48],
      ] },
  ];

  const worldCup = {
    id: 'r-worldcup', name: 'חגיגת מונדיאל', address: 'אצטדיון בלומפילד, תל אביב', phone: '',
    image: '', flat: 30,
    teams: [
      ['fr', 'צרפת', 'פרנץ\' טוסט מתוק'], ['de', 'גרמניה', 'המבורגר בווארי'], ['ar', 'ארגנטינה', 'אמפנדס בקר'],
      ['it', 'איטליה', 'פיצה מרגריטה'], ['br', 'ברזיל', 'פאו דה קז\'ו'], ['mx', 'מקסיקו', 'טאקוס אל פסטור'],
      ['es', 'ספרד', 'פאייה פירות ים'], ['us', 'ארה"ב', 'הוט דוג קלאסי'], ['jp', 'יפן', 'סושי רול'],
      ['gb', 'אנגליה', 'פיש אנד צ\'יפס'], ['pt', 'פורטוגל', 'פסטל דה נאטה'], ['nl', 'הולנד', 'סטרופוואפל'],
      ['be', 'בלגיה', 'צ\'יפס בלגי'], ['kr', 'דרום קוריאה', 'קערת ביבימבאפ'], ['gr', 'יוון', 'סובלאקי (שיפודים)'],
      ['uy', 'אורוגוואי', 'כריך צ\'יביטו'], ['ma', 'מרוקו', 'קוסקוס וטאג\'ין'], ['ch', 'שווייץ', 'פונדו גבינה'],
      ['co', 'קולומביה', 'אמפנדס תירס'], ['hr', 'קרואטיה', 'קבב צ\'באפצ\'יצ\'י'],
    ].map(([code, team, dish]) => ({ code, team, dish, flag: `https://flagcdn.com/w160/${code}.png` })),
  };

  restaurants.forEach((r) => {
    r.products = r.products.map(([name, description, price], i) => ({ id: `${r.id}-p${i}`, name, description, price }));
  });

  function hash(id) {
    let h = 0;
    for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h;
  }

  function meta(r) {
    const h = hash(r.id);
    const min = 15 + ((h >>> 7) % 5) * 5;
    const fee = [0, 0, 5, 9, 12][(h >>> 11) % 5];
    const prices = r.products.map((p) => p.price);
    return {
      rating: (7.9 + ((h >>> 3) % 21) / 10).toFixed(1),
      eta: `\u2066${min}–${min + 10}\u2069`, // LTR isolate: an en dash between numbers reverses in RTL
      etaMin: min,
      fee,
      feeLabel: fee ? `₪${fee} משלוח` : 'משלוח חינם',
      from: prices.length ? Math.min(...prices) : null,
      index: restaurants.indexOf(r) + 1,
    };
  }

  const price = (n) => `₪${Number(n).toLocaleString('en-US')}`;

  const now = Date.now();
  const orders = [
    { id: 'o-73cbf7', restaurant: 'r-burger', status: 'active', startTime: now - 21 * 60000, total: 153,
      items: [['המבורגר קלאסי', 62, 1], ['המבורגר פטריות', 69, 1], ['טבעות בצל', 22, 1]] },
    { id: 'o-51aa02', restaurant: 'r-sushi', status: 'past', date: 'אתמול', total: 172,
      items: [['מגש סלמון 16 יח׳', 128, 1], ['מרק מיסו', 22, 2]] },
    { id: 'o-4410cd', restaurant: 'r-pasta', status: 'past', date: '22 בספטמבר', total: 147,
      items: [['קצ׳ו א פפה', 68, 1], ['לזניה בולונז', 79, 1]] },
  ];

  return { restaurants, worldCup, orders, meta, price, byId: (id) => restaurants.find((r) => r.id === id) };
})();
