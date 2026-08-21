import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/api';

const ActiveOrderWidget = () => {
    // 1. אתחול כמערך ריק כדי למנוע שגיאות null
    const [activeOrders, setActiveOrders] = useState([]); 
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user || !user.username) return;

        const checkActiveOrder = async () => {
            try {
                const savedOrders = await getUserOrders();

                const currentActive = savedOrders.filter(order =>
                    order.status && order.status.includes('בדרך')
                );

                setActiveOrders(currentActive);
            } catch (error) {
                console.error("שגיאה בטעינת הזמנות פעילות:", error);
                setActiveOrders([]);
            }
        };

        checkActiveOrder();
        const interval = setInterval(checkActiveOrder, 2000);
        return () => clearInterval(interval);
    }, [user]);

    // 2. תנאי הסתרה: 
    // - אם אין הזמנות
    // - או שאנחנו בעמוד מעקב
    // - או שאנחנו בעמודי התחברות/הרשמה
    const isHidden = location.pathname.includes('/tracking') || 
                     ['/login', '/register'].some(path => location.pathname.includes(path));

    if (activeOrders.length === 0 || isHidden) {
        return null;
    }

    return (
        <div className="active-orders-container">
            {activeOrders.map(order => (
                <div key={order.id} className="active-order-widget" onClick={() => navigate(`/tracking/${order.id}`)}>
                    <div className="widget-icon">🛵</div>
                    <div className="widget-info">
                        <strong>הזמנה בדרך!</strong>
                        <span>{order.restaurantName || 'המשלוח שלך'}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActiveOrderWidget;