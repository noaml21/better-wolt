import React, { useState, useEffect } from 'react';
import { createOrder, getRestaurants } from '../services/api';
import { useAuth } from '../context/AuthContext';

const worldCupData = [
    { key: 'france', team: 'צרפת', dishName: 'פרנץ\' טוסט מתוק', price: 30, flag: 'https://flagcdn.com/w80/fr.png', image: 'https://cdn-icons-png.flaticon.com/512/3014/3014502.png' },
    { key: 'germany', team: 'גרמניה', dishName: 'המבורגר בווארי', price: 30, flag: 'https://flagcdn.com/w80/de.png', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
    { key: 'argentina', team: 'ארגנטינה', dishName: 'אמפנדס בקר', price: 30, flag: 'https://flagcdn.com/w80/ar.png', image: 'https://cdn-icons-png.flaticon.com/512/4821/4821815.png' },
    { key: 'italy', team: 'איטליה', dishName: 'פיצה מרגריטה', price: 30, flag: 'https://flagcdn.com/w80/it.png', image: 'https://cdn-icons-png.flaticon.com/512/3132/3132693.png' },
    { key: 'brazil', team: 'ברזיל', dishName: 'פאו דה קז\'ו', price: 30, flag: 'https://flagcdn.com/w80/br.png', image: 'https://cdn-icons-png.flaticon.com/512/1211/1211180.png' },
    { key: 'mexico', team: 'מקסיקו', dishName: 'טאקוס אל פסטור', price: 30, flag: 'https://flagcdn.com/w80/mx.png', image: 'https://cdn-icons-png.flaticon.com/512/2515/2515183.png' },
    { key: 'spain', team: 'ספרד', dishName: 'פאייה פירות ים', price: 30, flag: 'https://flagcdn.com/w80/es.png', image: 'https://cdn-icons-png.flaticon.com/512/5753/5753034.png' },
    { key: 'usa', team: 'ארה"ב', dishName: 'הוט דוג קלאסי', price: 30, flag: 'https://flagcdn.com/w80/us.png', image: 'https://cdn-icons-png.flaticon.com/512/1256/1256425.png' },
    { key: 'japan', team: 'יפן', dishName: 'סושי רול', price: 30, flag: 'https://flagcdn.com/w80/jp.png', image: 'https://cdn-icons-png.flaticon.com/512/2254/2254510.png' },
    { key: 'england', team: 'אנגליה', dishName: 'פיש אנד צ\'יפס', price: 30, flag: 'https://flagcdn.com/w80/gb.png', image: 'https://cdn-icons-png.flaticon.com/512/2934/2934069.png' },
    { key: 'portugal', team: 'פורטוגל', dishName: 'פסטל דה נאטה', price: 30, flag: 'https://flagcdn.com/w80/pt.png', image: 'https://cdn-icons-png.flaticon.com/512/2816/2816997.png' },
    { key: 'netherlands', team: 'הולנד', dishName: 'סטרופוואפל', price: 30, flag: 'https://flagcdn.com/w80/nl.png', image: 'https://cdn-icons-png.flaticon.com/512/2619/2619515.png' },
    { key: 'belgium', team: 'בלגיה', dishName: 'צ\'יפס בלגי', price: 30, flag: 'https://flagcdn.com/w80/be.png', image: 'https://cdn-icons-png.flaticon.com/512/2515/2515152.png' },
    { key: 'south-korea', team: 'דרום קוריאה', dishName: 'קערת ביבימבאפ', price: 30, flag: 'https://flagcdn.com/w80/kr.png', image: 'https://cdn-icons-png.flaticon.com/512/3504/3504865.png' },
    { key: 'greece', team: 'יוון', dishName: 'סובלאקי (שיפודים)', price: 30, flag: 'https://flagcdn.com/w80/gr.png', image: 'https://cdn-icons-png.flaticon.com/512/1895/1895696.png' },
    { key: 'uruguay', team: 'אורוגוואי', dishName: 'כריך צ\'יביטו', price: 30, flag: 'https://flagcdn.com/w80/uy.png', image: 'https://cdn-icons-png.flaticon.com/512/3143/3143645.png' },
    { key: 'morocco', team: 'מרוקו', dishName: 'קוסקוס וטאג\'ין', price: 30, flag: 'https://flagcdn.com/w80/ma.png', image: 'https://cdn-icons-png.flaticon.com/512/2318/2318357.png' },
    { key: 'switzerland', team: 'שווייץ', dishName: 'פונדו גבינה', price: 30, flag: 'https://flagcdn.com/w80/ch.png', image: 'https://cdn-icons-png.flaticon.com/512/3065/3065735.png' },
    { key: 'colombia', team: 'קולומביה', dishName: 'אמפנדס תירס', price: 30, flag: 'https://flagcdn.com/w80/co.png', image: 'https://cdn-icons-png.flaticon.com/512/1256/1256201.png' },
    { key: 'croatia', team: 'קרואטיה', dishName: 'קבב צ\'באפצ\'יצ\'י', price: 30, flag: 'https://flagcdn.com/w80/hr.png', image: 'https://cdn-icons-png.flaticon.com/512/2034/2034001.png' }
];

const WorldCupFeature = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const [audio] = useState(new Audio('music.mp3'));

    const toggleWorldCup = () => {
        if (!isOpen) {
            audio.play().catch(e => console.error("Audio play failed:", e));
            setIsOpen(true);
        } else {
            audio.pause();      
            audio.currentTime = 0;
            setIsOpen(false);
        }
    };

    useEffect(() => {
        return () => {
            audio.pause();
        };
    }, [audio]);

    const handleAddToOrder = async (item) => {
        if (!user) {
            alert("חובה להתחבר כדי לבצע הזמנה!");
            return;
        }

        try {
            const serverRestaurants = await getRestaurants();
            const worldCupRestaurant = serverRestaurants.find(r => r.name === 'חגיגת מונדיאל');

            if (!worldCupRestaurant) {
                alert("שגיאה: מסעדת 'חגיגת מונדיאל 🏆' עדיין לא הוקמה במערכת.\nאנא צרו אותה פעם אחת דרך כפתור 'צור מסעדה חדשה'.");
                return;
            }

            const product = worldCupRestaurant.products.find(
                serverProduct => serverProduct.name === item.dishName
            );

            if (!product) {
                alert('שגיאה: המנה שנבחרה אינה זמינה כרגע.');
                return;
            }

            const orderData = {
                restaurant: worldCupRestaurant.id,
                products: [
                    { id: product.id, quantity: 1 }
                ]
            };

            await createOrder(orderData);
            alert(`טירוף! ה-${item.dishName} של ${item.team} הוזמן בהצלחה! 🏆\nתוכלו לראות את ההזמנה באזור האישי.`);

        } catch (error) {
            console.error('Failed to create world cup order:', error);
            alert('אופס, משהו השתבש ביצירת ההזמנה ברמת השרת.');
        }
    };

    return (
        <div className="world-cup-container" style={{ textAlign: 'center' }}>
            <button
                onClick={toggleWorldCup}
                style={{
                    backgroundColor: '#1E40AF',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                ⚽ {isOpen ? 'סגור תפריט מונדיאל' : 'תפריט מונדיאל מיוחד'} 🏆
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 9999,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        position: 'relative',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '16px',
                        padding: '30px',
                        width: '100%',
                        maxWidth: '900px',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                        <button 
                            onClick={toggleWorldCup}
                            style={{
                                position: 'absolute', top: '15px', right: '15px',
                                backgroundColor: '#ff4757', color: 'white',
                                border: 'none', borderRadius: '50%',
                                width: '35px', height: '35px',
                                fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            X
                        </button>
                        <h2 style={{ textAlign: 'center', color: '#1e40af', marginTop: 0 }}>תפריט מונדיאל מיוחד 🏆</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                            {worldCupData.map((item) => (
                                <div key={item.key} style={{
                                    backgroundColor: 'white', padding: '15px', borderRadius: '12px',
                                    width: '160px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    textAlign: 'center', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <img src={item.flag} alt={item.team} style={{ width: '40px', borderRadius: '4px' }} />
                                    <h4 style={{ margin: '10px 0 5px 0' }}>{item.team}</h4>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555', flexGrow: 1 }}>{item.dishName}</p>
                                    <img src={item.image} alt={item.dishName} style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                                    <p style={{ fontWeight: 'bold', margin: '10px 0 5px 0', color: '#1e40af', fontSize: '1.1rem' }}>₪{item.price}</p>
                                    <button
                                        onClick={() => handleAddToOrder(item)}
                                        style={{
                                            width: '100%', marginTop: '10px', backgroundColor: '#22c55e',
                                            color: 'white', border: 'none', borderRadius: '6px',
                                            padding: '8px', cursor: 'pointer', fontWeight: 'bold',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        הוסף להזמנה
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorldCupFeature;
