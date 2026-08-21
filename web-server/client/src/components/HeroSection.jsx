import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png';
import WorldCupFeature from './WorldCupFeature';

const HeroSection = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="hero-wrapper">
            {/* הלוגו במרכז */}
            <img src={logo} alt="לוגו" className="hero-image" />
            
            {/* כותרת ראשית */}
            <h1 className="hero-title">
                פיצה?<br />
                בדרך אלייך.
            </h1>

            {/* אזור הכפתורים (ללא הכפתור הסגול) */}
            <div className="hero-buttons" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                {!isAuthenticated && (
                    <>
                        <Link to="/login" className="pill-button" style={{ textDecoration: 'none' }}>
                            <span>התחברות</span>
                        </Link>
                        <Link to="/register" className="pill-button" style={{ textDecoration: 'none' }}>
                            <span>הרשמה</span>
                        </Link>
                    </>
                )}
            </div>

            {/* --- אזור התחתית: כפתור מונדיאל וחץ גלילה --- */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '20px', 
                marginTop: '30px',
                zIndex: 50 
            }}>
                <WorldCupFeature />

                {/* רמז הגלילה (Scroll Indicator) */}
                <div 
                    className="scroll-indicator"
                    onClick={() => document.getElementById('restaurants-section')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                >
                    <span style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '4px' }}>
                        גלו את המסעדות שלנו
                    </span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
