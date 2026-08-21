import React from 'react';
import { Link } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ id, name, imageUrl, rating, deliveryTime, deliveryFee, promoText }) => {
    return (
        // הקישור לעמוד המסעדה (למשל /restaurant/1)
        <Link to={`/restaurant/${id}`} className="restaurant-card">
            
            {/* אזור התמונה */}
            <div className="card-image-wrapper">
                <img src={imageUrl} alt={name} className="card-image" />
            </div>

            {/* אזור הטקסט */}
            <div className="card-content">
                <h3 className="card-title">{name}</h3>
                
                <div className="card-meta">
                    <span className="meta-item">
                        <svg className="icon-tiny" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                        {rating}
                    </span>
                    <span className="separator">·</span>
                    <span className="meta-item">{deliveryTime} דקות</span>
                    <span className="separator">·</span>
                    <span className="meta-item">
                        <svg className="icon-tiny" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4l3 3"/>
                        </svg>
                        ₪{deliveryFee}
                    </span>
                </div>

                {/* תגית מבצע (אם יש למסעדה כזו) */}
                {promoText && (
                    <div className="promo-badge">
                        <span className="heart-icon">💙</span>
                        {promoText}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default RestaurantCard;