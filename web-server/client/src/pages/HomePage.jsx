import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurants, createRestaurant } from '../services/api';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import AdsSidebar from '../components/AdsSidebar';

export default function HomePage() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRestaurant, setNewRestaurant] = useState({
        name: "",
        phone: "",
        address: "",
        image: ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const { isAuthenticated, user } = useAuth();

    async function fetchData() {
        try {
            setLoading(true);
            const data = await getRestaurants();
            setRestaurants(data);
        } catch (err) {
            setError('מצטערים, לא ניתן להציג את המסעדות כרגע.');
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                username: user.username,
                name: newRestaurant.name,
                phone: newRestaurant.phone,
                address: newRestaurant.address,
                image: newRestaurant.image || ''
            };

            await createRestaurant(payload);
            await fetchData();

            setNewRestaurant({ name: "", phone: "", address: "", image: "" });
            setIsModalOpen(false);

        } catch (error) {
            console.error("שגיאה ביצירת מסעדה:", error);
            setErrorMessage(error.message || "לא הצלחנו ליצור את המסעדה. ודא שכל השדות מלאים.");
            setTimeout(() => setErrorMessage(""), 8080);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="spinner">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="page-content">
            {/* הבאנר העליון שתופס מסך שלם */}
            <HeroSection />

            <AdsSidebar />

            {/* לכאן חץ הגלילה מוביל אותנו */}
            <div id="restaurants-section" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
                <h2>עמוד הבית</h2>
                <h3>אלה המסעדות שלנו:</h3>

                {isAuthenticated && user?.role === 'restaurant' && (
                    <button className="create-restaurant-btn" onClick={() => setIsModalOpen(true)}>
                        <span className="btn-icon">🍔</span> צור מסעדה חדשה
                    </button>
                )}

                {/* רינדור המסעדות */}
                {restaurants.map((rest) => (
                    <div key={rest.id} className="menu-card">
                        {rest.image && (
                            <img
                                src={rest.image}
                                alt={rest.name}
                                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px' }}
                            />
                        )}
                        <h4>{rest.name}</h4>
                        <div className="card-actions">
                            <Link to={`/restaurant/${rest.id}`}>
                                <button>צפה במסעדה</button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* מודאל הוספת מסעדה */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>➕ הוספת מסעדה חדשה</h3>
                        <form onSubmit={handleSubmit}>
                            <label>שם המסעדה:</label>
                            <input
                                type="text"
                                placeholder="hemiburger"
                                value={newRestaurant.name}
                                onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                                required
                            />
                            <label>קישור לתמונה (URL):</label>
                            <input
                                type="text"
                                placeholder="https://example.com/image.png"
                                value={newRestaurant.image}
                                onChange={(e) => setNewRestaurant({ ...newRestaurant, image: e.target.value })}
                            />
                            <div className="modal-actions">
                                <button type="submit" className="save-btn">שמור מסעדה</button>
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>ביטול</button>
                            </div>
                        </form>
                    </div>
                    {errorMessage && (
                        <div className="toast-container">
                            <div className="toast error">{errorMessage}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}