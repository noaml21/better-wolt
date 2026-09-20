/* The campaign's presentation data.

   The restaurant name and every `dishName` below must equal what the
   server seeds in web-server/src/seed/worldCup.js — both clients match
   dishes by name, and ARCHITECTURE §6 makes those names contract.
   Renaming one means changing the seed and both clients in one commit.
   This list is the same as the web client's services/worldCup.js; the
   flags are presentation only. */

export const worldCupTeams = [
  { dishName: 'פרנץ\' טוסט מתוק', team: 'צרפת', flag: 'https://flagcdn.com/w80/fr.png' },
  { dishName: 'המבורגר בווארי', team: 'גרמניה', flag: 'https://flagcdn.com/w80/de.png' },
  { dishName: 'אמפנדס בקר', team: 'ארגנטינה', flag: 'https://flagcdn.com/w80/ar.png' },
  { dishName: 'פיצה מרגריטה', team: 'איטליה', flag: 'https://flagcdn.com/w80/it.png' },
  { dishName: 'פאו דה קז\'ו', team: 'ברזיל', flag: 'https://flagcdn.com/w80/br.png' },
  { dishName: 'טאקוס אל פסטור', team: 'מקסיקו', flag: 'https://flagcdn.com/w80/mx.png' },
  { dishName: 'פאייה פירות ים', team: 'ספרד', flag: 'https://flagcdn.com/w80/es.png' },
  { dishName: 'הוט דוג קלאסי', team: 'ארה"ב', flag: 'https://flagcdn.com/w80/us.png' },
  { dishName: 'סושי רול', team: 'יפן', flag: 'https://flagcdn.com/w80/jp.png' },
  { dishName: 'פיש אנד צ\'יפס', team: 'אנגליה', flag: 'https://flagcdn.com/w80/gb.png' },
  { dishName: 'פסטל דה נאטה', team: 'פורטוגל', flag: 'https://flagcdn.com/w80/pt.png' },
  { dishName: 'סטרופוואפל', team: 'הולנד', flag: 'https://flagcdn.com/w80/nl.png' },
  { dishName: 'צ\'יפס בלגי', team: 'בלגיה', flag: 'https://flagcdn.com/w80/be.png' },
  { dishName: 'קערת ביבימבאפ', team: 'דרום קוריאה', flag: 'https://flagcdn.com/w80/kr.png' },
  { dishName: 'סובלאקי (שיפודים)', team: 'יוון', flag: 'https://flagcdn.com/w80/gr.png' },
  { dishName: 'כריך צ\'יביטו', team: 'אורוגוואי', flag: 'https://flagcdn.com/w80/uy.png' },
  { dishName: 'קוסקוס וטאג\'ין', team: 'מרוקו', flag: 'https://flagcdn.com/w80/ma.png' },
  { dishName: 'פונדו גבינה', team: 'שווייץ', flag: 'https://flagcdn.com/w80/ch.png' },
  { dishName: 'אמפנדס תירס', team: 'קולומביה', flag: 'https://flagcdn.com/w80/co.png' },
  { dishName: 'קבב צ\'באפצ\'יצ\'י', team: 'קרואטיה', flag: 'https://flagcdn.com/w80/hr.png' },
];

export const teamByDish = new Map(worldCupTeams.map((entry) => [entry.dishName, entry]));
