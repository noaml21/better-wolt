import React, { useState, useEffect } from 'react';
import './AdsSidebar.css';

// מערך הפרסומות - מגדירים נתיב לוידאו ואת הזמן המדויק באלפיות שניה
const adsData = [
    {
        id: 'pizza-hut',
        src: '/ads/pizza-hut.mp4',
        duration: 15000, // 15 שניות
        alt: 'פרסומת פיצה האט'
    },
    {
        id: 'bar-ilan',
        src: '/ads/bar-ilan.mp4',
        duration: 21000, // 21 שניות
        alt: 'פרסומת אוניברסיטת בר אילן'
    }
];

const AdsSidebar = () => {
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    useEffect(() => {
        // שולפים את הפרסומת הנוכחית כדי לדעת כמה זמן היא צריכה לרוץ
        const currentAd = adsData[currentAdIndex];

        // מפעילים טיימר שמעביר לפרסומת הבאה בדיוק כשהוידאו נגמר
        const timer = setTimeout(() => {
            setCurrentAdIndex((prevIndex) => (prevIndex + 1) % adsData.length);
        }, currentAd.duration);

        // ניקוי הטיימר במקרה שהקומפוננטה יורדת מהמסך
        return () => clearTimeout(timer);
    }, [currentAdIndex]);

    const currentAd = adsData[currentAdIndex];

    return (
        <div className="ads-sidebar-container">
            <div className="ad-content">
                <span className="ad-badge">ממומן</span>
                {/* ה-key חשוב פה: כשמשנים את ה-key, ריאקט טוען את תגית הוידאו מחדש,
                  מה שמבטיח שהוידאו יתחיל להתנגן מההתחלה בכל פעם שהוא מתחלף.
                */}
                <video
                    key={currentAd.id}
                    src={currentAd.src}
                    autoPlay
                    muted /* חייבים להשתיק כדי שהדפדפן יאפשר הפעלה אוטומטית */
                    playsInline
                    className="ad-video"
                />
            </div>
        </div>
    );
};

export default AdsSidebar;