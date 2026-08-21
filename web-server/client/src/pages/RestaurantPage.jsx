import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RestaurantMenu from '../components/RestaurantMenu';
import Toast from '../components/Toast';
import { addProduct, updateProduct, deleteProduct, updateRestaurant, deleteRestaurant, createOrder, getRestaurantById } from '../services/api';

const RestaurantPage = () => {
    const handleCreateProduct = async (e) => {
        e.preventDefault();

        try {
            const productData = {
                name: newProduct.name,
                description: newProduct.description,
                price: Number(newProduct.price)
            };

            if (editingProduct) {
                await updateProduct(id, editingProduct.id, productData);

                setRestaurant(prev => ({
                    ...prev,
                    products: (prev.products || []).map(product =>
                        String(product.id) === String(editingProduct.id)
                            ? { ...product, ...productData, id: editingProduct.id }
                            : product
                    )
                }));

                setToast({ message: 'המנה עודכנה בהצלחה!', type: 'success' });
            } else {
                const createdProduct = await addProduct(id, productData);

                setRestaurant(prev => ({
                    ...prev,
                    products: [...(prev.products || []), createdProduct]
                }));

                setToast({ message: 'מנה נוספה בהצלחה!', type: 'success' });
            }

            setIsProductModalOpen(false);
            setEditingProduct(null);
            setNewProduct({
                name: "",
                description: "",
                price: ""
            });

        } catch (error) {
            console.error("שגיאה בשמירת מנה:", error);
            setToast({ message: 'שגיאה בשמירת מנה', type: 'error' });
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("למחוק את המנה הזו מהתפריט?")) return;

        try {
            await deleteProduct(id, productId);

            setRestaurant(prev => ({
                ...prev,
                products: (prev.products || []).filter(product =>
                    String(product.id) !== String(productId)
                )
            }));

            setToast({ message: 'המנה נמחקה!', type: 'success' });
            // כאן כדאי לרענן את הנתונים מהשרת או לעדכן את state המסעדה
        } catch (error) {
            console.error("שגיאה במחיקה:", error);
            setToast({ message: 'שגיאה במחיקת המנה', type: 'error' });
        }
    };
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [cart, setCart] = useState([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: ""
    });

    const [editingProduct, setEditingProduct] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const openEditProductModal = (product) => {
        setEditingProduct(product);

        setNewProduct({
            name: product.name || '',
            description: product.description || '',
            price: product.price || ''
        });

        setIsProductModalOpen(true);
    };

    // State חדש שמנהל את ה-Toast (מכיל את ההודעה והסוג שלה)
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const data = await getRestaurantById(id);
                setRestaurant(data);
            } catch (error) {
                console.error("שגיאה בטעינת מסעדה:", error);
                setToast({ message: 'לא הצלחנו לטעון את המסעדה', type: 'error' });
            }
        };

        fetchRestaurant();
    }, [id]);

    const handleAddToCart = (product) => {
        setCart((prevCart) => [...prevCart, product]);
        // מקפיצים Toast בכל פעם שפריט נוסף לסל!
        setToast({ message: `🍔 ${product.name} נוסף לסל!`, type: 'success' });
    };
    const handleEditSubmit = async (e) => {
        e.preventDefault(); // עוצר את רענון הדף
        try {
            await updateRestaurant(id, restaurant);
            setIsEditModalOpen(false);
            setToast({ message: 'המסעדה עודכנה בהצלחה! ✏️', type: 'success' });
        } catch (error) {
            console.error("שגיאה בעדכון:", error);
            setToast({ message: 'שגיאה בעדכון המסעדה', type: 'error' });
        }
    };
    const handleDelete = async () => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק מסעדה זו? הפעולה בלתי הפיכה.")) return;

        try {
            await deleteRestaurant(id);
            navigate('/');
        } catch (error) {
            console.error("שגיאה במחיקה:", error);
        }
    };

    const handleRemoveFromCart = (indexToRemove) => {
        setCart((prevCart) => prevCart.filter((_, index) => index !== indexToRemove));
    };

    const handlePlaceOrder = () => {
        if (cart.length === 0) return;

        if (!isAuthenticated) {
            setToast({ message: 'עליך להתחבר כדי לבצע הזמנה 🔒', type: 'error' });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        const productQuantities = cart.reduce((quantities, item) => {
            const productId = String(item.id);

            quantities.set(productId, (quantities.get(productId) || 0) + 1);
            return quantities;
        }, new Map());

        const orderData = {
            restaurant: restaurant.id,
            products: Array.from(productQuantities, ([productId, quantity]) => ({
                id: productId,
                quantity
            }))
        };

        createOrder(orderData)
            .then((createdOrder) => {
                setCart([]);
                navigate(`/tracking/${createdOrder.id}`);
            })
            .catch((error) => {
                console.error("שגיאה ביצירת הזמנה:", error);
                setToast({ message: 'שגיאה ביצירת הזמנה', type: 'error' });
            });
    };
    if (!restaurant) {
        return <div className="page-content">טוען נתונים...</div>;
    }

    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    const isOwner = isAuthenticated && user?.username === restaurant?.username;

    return (
        <div className="page-content">
            <div className="restaurant-header">
                {restaurant.image && (
                    <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        style={{
                            width: '100%',
                            maxHeight: '260px',
                            objectFit: 'cover',
                            borderRadius: '16px',
                            marginBottom: '16px'
                        }}
                    />
                )}

                <h2>{restaurant.name}</h2>
                <p>{restaurant.description}</p>
                {isOwner && (
                    <div className="admin-actions">
                        <button className="edit-btn" onClick={() => setIsEditModalOpen(true)}>✏️ ערוך מסעדה</button>
                        <button className="delete-btn" onClick={handleDelete}>🗑️ מחק מסעדה</button>
                    </div>
                )}
            </div>

            <div className="restaurant-layout">
                <div className="menu-section">
                    <h3>תפריט המסעדה</h3>
                    <RestaurantMenu products={restaurant.products} onAddToCart={handleAddToCart} />
                </div>

                <div className="cart-sidebar">
                    <h3>הסל שלי 🛒</h3>
                    {cart.length === 0 ? (
                        <p>הסל כרגע ריק.</p>
                    ) : (
                        <>
                            <ul className="cart-items">
                                {cart.map((item, index) => (
                                    <li key={index} className="cart-item">
                                        <span>{item.name}</span>
                                        <div className="cart-item-actions">
                                            <span className="cart-item-price">₪{item.price}</span>
                                            <button className="remove-btn" onClick={() => handleRemoveFromCart(index)}>❌</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="cart-summary">
                                <div className="cart-total">
                                    <span>סה"כ לתשלום:</span>
                                    <strong>₪{totalPrice}</strong>
                                </div>
                                <button className="place-order-btn" onClick={handlePlaceOrder}>
                                    בצע הזמנה
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>✏️ עריכת פרטי מסעדה</h3>
                        <form onSubmit={handleEditSubmit}>
                            <label>שם המסעדה:</label>
                            <input
                                type="text"
                                value={restaurant.name}
                                onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                                required
                            />

                            <label>תיאור המסעדה:</label>
                            <input
                                type="text"
                                value={restaurant.description}
                                onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
                            />
                            <label>מחיר (₪):</label>
                            <input
                                type="number"
                                name="price"
                                value={newProduct.price}
                                onChange={handleChange}
                            />
                        </form>
                    </div>
                </div>
            )}
            {isProductModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingProduct ? '✏️ עריכת מנה' : '🍴 ניהול תפריט'}</h3>

                        {/* 1. רשימת המנות הקיימות עם כפתור מחיקה */}
                        <ul className="admin-menu-list">
                            {(restaurant.products || []).map((product) => (
                                <li
                                    key={product.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <span>{product.name} - ₪{product.price}</span>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="edit-btn"
                                            onClick={() => openEditProductModal(product)}
                                        >
                                            ✏️ ערוך
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteProduct(product.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <hr />

                        {/* 2. הטופס להוספת מנה חדשה */}
                        <form onSubmit={handleCreateProduct}>
                            <label>שם המנה:</label>
                            <input
                                type="text"
                                name="name"
                                value={newProduct.name}
                                onChange={handleChange}
                            />
                            <label>תיאור המנה:</label>
                            <input
                                type="text"
                                name="description"
                                value={newProduct.description}
                                onChange={handleChange}
                            />
                            <input
                                type="number"
                                name="price"
                                value={newProduct.price}
                                onChange={handleChange}
                            />
                            <button type="submit">
                                {editingProduct ? 'שמור שינויים' : 'הוסף מנה'}
                            </button>
                            <button type="button" onClick={() => setIsProductModalOpen(false)}>סגור</button>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. הכפתור שפותח את המודאל */}
            {isOwner && (
                <div className="editMenu">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                            setEditingProduct(null);
                            setNewProduct({ name: "", description: "", price: "" });
                            setIsProductModalOpen(true);
                        }}
                    >
                        ערוך תפריט
                    </button>
                </div>
            )}
            {/* קומפוננטת ה-Toast שלנו מרחפת מעל הכל */}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: '' })}
            />
        </div>
    );
};

export default RestaurantPage;
