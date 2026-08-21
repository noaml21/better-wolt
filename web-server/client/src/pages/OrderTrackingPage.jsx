import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrderById } from '../services/api';
const OrderTrackingPage = () => {
    const { orderId } = useParams();
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!user?.username || !orderId) return;

        const loadOrder = async () => {
            try {
                const order = await getOrderById(orderId);

                if (order && order.startTime) {
                    const elapsed = Math.floor((new Date().getTime() - order.startTime) / 1000);
                    const remaining = Math.max(0, 1800 - elapsed);
                    setTimeLeft(remaining);
                } else {
                    setTimeLeft(1800);
                }
            } catch (error) {
                console.error("לא הצלחנו לטעון את ההזמנה מהשרת:", error);
                setTimeLeft(0);
            }
        };

        loadOrder();

        // טיימר
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                // אם הערך הוא 0 או שעדיין לא חושב
                if (!prev) {
                    clearInterval(timerRef.current); // 1. עוצרים את פעולת ה-setInterval ברקע
                    return 0; // 2. מבטיחים שה-State יישאר בדיוק על 0 ולא ירד למינוס
                }

                // כל עוד יש זמן, מורידים שנייה אחת
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [orderId, user]);
    // מאזין אקטיבי לטיימר - משנה סטטוס רק כשהזמן מגיע ל-0
    // אם עדיין לא נטען
    if (timeLeft === null) return <div className="page-content">טוען נתונים...</div>;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const progressPercent = ((1800 - timeLeft) / 1800) * 100;

    return (
        <div className="page-content tracking-page">
            <h2>מעקב הזמנה</h2>
            <p className="tracking-id">הזמנה #{orderId}</p>

            <div className="eta-container">
                <div className="eta-circle">
                    <span className="time">{minutes}:{formattedSeconds}</span>
                    <span className="label">דקות להגעה</span>
                </div>
            </div>

            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>

            <div className="tracking-status">
                {timeLeft > 1500 ? 'המסעדה מכינה את ההזמנה שלך 🍳' :
                    timeLeft > 0 ? 'השליח בדרך אליך 🛵' : 'בתיאבון! ההזמנה הגיעה 🎉'}
            </div>

            <div style={{ marginTop: '2rem' }}>
                <Link to="/orders">
                    <button className="secondary-btn">צפה בהיסטוריית הזמנות</button>
                </Link>
            </div>
        </div>
    );
};

export default OrderTrackingPage;