import React from 'react';
import RestaurantCard from '../components/RestaurantCard';

const RestaurantsPage = () => {
    return (
        <div className="page-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px', textAlign: 'right' }}>המסעדות שלנו</h1>
            {/* רשת המסעדות (Grid) - מסדר אותן בשורות יפות */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>

                {/* המסעדה הראשונה שלנו */}
                <RestaurantCard
                    id="1"
                    name="גולדה | פתח תקווה"
                    imageUrl="https://xtra.co.il/cdn/shop/files/1_-_-_250_160.png?v=1772545972"
                    rating="7.8"
                    deliveryTime="30-40"
                    deliveryFee="0.00"
                    promoText="15₪ הנחה על דמי המשלוח"
                />

                {/* כאן תוכלי להוסיף עוד כרטיסיות <RestaurantCard /> בעתיד */}

            </div>
        </div>
    );
};

export default RestaurantsPage;