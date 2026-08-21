import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // הוספנו ייבוא
import { getUserOrders } from '../services/api';

const OrdersPage = () => {
  const { user } = useAuth(); // שולפים את המשתמש המחובר כרגע
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const serverOrders = await getUserOrders();
        setOrders(serverOrders);
      } catch (error) {
        console.error("שגיאה בטעינת ההזמנות:", error);
        setError('לא הצלחנו לטעון את ההזמנות.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.username]);


  if (loading) return <div className="page-content">טוען את היסטוריית ההזמנות שלך... ⏳</div>;
  if (error) return <div className="page-content"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-content">
      <h2>ההזמנות שלי 📦</h2>

      {orders.length === 0 ? (
        <p>עדיין לא ביצעת הזמנות. זה הזמן להתחיל! 🍔</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <strong>הזמנה #{order.id}</strong>
                <span className={`order-status ${order.status.includes('הושלם') ? 'status-done' : 'status-active'}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <p>תאריך: {order.date}</p>
                <p>כמות פריטים: {order.items}</p>
                <p>מסעדה: {order.restaurantName}</p>
                <p className="order-total">סה"כ שולם: ₪{order.total}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;